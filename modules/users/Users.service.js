const UserHierarchyService = require('./User-hierarchy/UserHierarchy.service')
const { getTenantDbConnection, getAdminConnection } = require('../../configuration/ConnectionManager')
const OrganisationsService = require('../organisations/Organisations.service')
const { COLLECTION_NAMES, HTTP_CONSTANTS, COLLECTION_STATUS } = require('../../configuration/Constants')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const CustomError = require('../../configuration/CustomError')

class UsersService {
    async createAdminUser(payload) {
        try {
            const masterConnection = getAdminConnection()
            let tenantConnection = ''

            //Create organisation
            let organisationPaylod = {
                name: payload.organisationName,
                description: payload.description
            }
            console.log(organisationPaylod);
            const doesOrganisationCreated = await OrganisationsService.createOrganisation(organisationPaylod, masterConnection)
            if (!doesOrganisationCreated)
                throw new CustomError('Error while creating organisation', HTTP_CONSTANTS.INTERNAL_SERVER_ERROR)
            else tenantConnection = doesOrganisationCreated.tenant


            const UserModel = tenantConnection.model('users')

            //Check for any duplicate user
            const doesUserExist = await UserModel.findOne({ email: payload.email.trim() })
            if (doesUserExist)
                throw new CustomError('Role already exist', 409)

            payload.organisationId = doesOrganisationCreated.oragnisationId

            payload.password = bcrypt.hashSync(payload.password, 8)

            //Create role
            const createdUser = await new UserModel(payload).save()

            //Create user hierarchy
            let userHierarchyPayload = {
                childUserId: createdUser._id,
                parentUserId: null
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
                .select({ password: 0 })
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
            const doesOrganisationExist = await OrganisationModelAtMaster.findOne({ name: headers.organisationname })
            if (!doesOrganisationExist)
                throw new CustomError('Organisation not found', 404)

            const tenantConnection = await getTenantDbConnection({ name: doesOrganisationExist.name, dbURL: doesOrganisationExist.dbURL })
            if (tenantConnection) {
                const UserModel = tenantConnection.model(COLLECTION_NAMES.USERS)
                const doesUserExist = await UserModel.findOne({ email: payload.email }).lean()
                if (!doesUserExist)
                    throw new CustomError('User not found', HTTP_CONSTANTS.NOT_FOUND)
                else if (doesUserExist.status === COLLECTION_STATUS.INACTIVE)
                    throw new CustomError('User is inactive', HTTP_CONSTANTS.NOT_ACCEPTABLE)

                const doesPasswordMatched = await bcrypt.compare(payload.password, doesUserExist.password);
                if (!doesPasswordMatched)
                    throw new CustomError('Incorrect password', HTTP_CONSTANTS.FORBIDDEN)

                doesUserExist.organisationName = doesOrganisationExist.name

                delete doesUserExist.password

                let token = jwt.sign(doesUserExist, process.env.JWT_SECRET, { expiresIn: '1d' });

                return {
                    status: true,
                    message: 'User logged in successfully',
                    token: token
                }

            }
        } catch (error) {
            throw new CustomError(`Error while logging in ${error}`, 500)

        }
    }

    async getReportees(userId, organisationId, tenantConnection) {
        try {
            let reporteesList = [];
            let searchQuery = {
                organisationId: mongoose.Types.ObjectId(organisationId),
                status: COLLECTION_STATUS.ACTIVE
            };
            searchQuery = { ...searchQuery, ...{ parentUserId: (typeof userId === 'string') ? mongoose.Types.ObjectId(userId) : { $in: userId } } };
            let UserHierarchiesModel = tenantConnection.model(COLLECTION_NAMES.USER_HIERARCHY);
            let reportees = await UserHierarchiesModel.distinct('childUserId', searchQuery);
            let reporteesIdsHolder = [];
            if (reportees && reportees.length > 0)
                reportees.forEach(async ele => { reporteesIdsHolder = [...reporteesIdsHolder, ele]; });

            if (reporteesIdsHolder && reporteesIdsHolder.length > 0)
                reporteesList = [...reporteesList, ...reporteesIdsHolder, ...await this.getReportees(reporteesIdsHolder, organisationId, tenantConnection)];
            if (typeof (userId) === 'string')
                reporteesList.push(new mongoose.Types.ObjectId(userId));
            else reporteesList.concat(userId);
            return reporteesList;
        } catch (error) {
            throw new CustomError(`Error while fetching  reportees : ${error.message}`, 500)
        }
    }
}

module.exports = new UsersService()