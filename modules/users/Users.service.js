const UserHierarchyService = require('./User-hierarchy/UserHierarchy.service')
const { getTenantDbConnection, getAdminConnection } = require('../../configuration/ConnectionManager')
const { COLLECTION_NAMES, HTTP_CONSTANTS, COLLECTION_STATUS } = require('../../configuration/Constants')
const bcrypt = require('bcrypt')
const jwt=require('jsonwebtoken')

class UsersService {

    async createUser(payload, tenantConnection, token) {
        try {
            const UserModel = tenantConnection.model('users')

            //Check for any duplicate user
            const doesUserExist = await UserModel.findOne({ email: payload.email.trim() })
            if (doesUserExist)
                throw new CustomError('Role already exist', 409)

            payload.organisationId = token.organisationId

            payload.password = bcrypt.hashSync(payload.password, 8)

            //Create role
            const createdUser = await new UserModel(payload).save()

            //Create user hierarchy
            let userHierarchyPayload = {
                childUserId: createdUser._id,
                parentUserId: payload.parentUserId
            }
            await UserHierarchyService.createUserHierarchy(userHierarchyPayload, tenantConnection, token)

            return {
                status: true,
                message: 'User created!'
            }
        } catch (error) {
            throw new CustomError('Error while creating new user', 500)
        }
    }

    async getUsers(tenantConnection, query, token) {
        try {
            const page = query.offset ? parseInt(query.offset) : 0;
            const pagination = query.limit ? parseInt(query.limit) : 10;
            const UserModel = tenantConnection.model('users')

            //Find all the users
            const doesUsersExists = await UserModel
                .find({ organisationId: token.organisationId })
                .select({password:0})
                .sort({ 'createdAt': -1 })
                .skip((page) * pagination)
                .limit(pagination)
            if (!doesUsersExists)
                throw new CustomError('Users not found', 404)

            return {
                status: true,
                message: 'Users restreival success',
                users: doesUsersExists
            }
        } catch (error) {
            throw new CustomError('Error while fetching users', 500)
        }
    }

    async login(payload, headers) {
        try {
            const masterConnection = getAdminConnection()
            const OrganisationModelAtMaster = masterConnection.model(COLLECTION_NAMES.ORGANISATIONS)
            const doesOrganisationExist = await OrganisationModelAtMaster.findOne({ name: headers.organisationName })
            if (!doesOrganisationExist)
                throw new CustomError('Organisation not found', 404)

            const tenantConnection = getTenantDbConnection({ organisationName: doesOrganisationExist.name, dbURL: doesOrganisationExist.dbURL })
            if (tenantConnection) {
                const UserModel = tenantConnection.model(COLLECTION_NAMES.USERS)
                const doesUserExist = await UserModel.findOne({ email: payload.email }).lean()
                if (!doesUserExist)
                    throw new CustomError('User not found', HTTP_CONSTANTS.NOT_FOUND)
                else if (doesUserExist.status === COLLECTION_STATUS.INACTIVE)
                    throw new CustomError('User is inactive', HTTP_CONSTANTS.NOT_ACCEPTABLE)

                const doesPasswordMatched = await bcrypt.compare(payload.password, doesUserExist.password);
                if (!doesPasswordMatched)
                    throw new CustomError('Incorrect password',HTTP_CONSTANTS.FORBIDDEN)

                delete doesUserExist.password

                let token= jwt.sign(doesUserExist, process.env.JWT_SECRET, { expiresIn: '1d' });    

                return {
                    status:true,
                    message:'User logged in successfully',
                    token:token
                }
                
            }
        } catch (error) {

        }
    }
}

module.exports = new UsersService()