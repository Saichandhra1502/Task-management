const UserHierarchyService = require('./User-hierarchy/UserHierarchy.service')

class UsersService {

    async createUser(payload, tenantConnection, token) {
        try {
            const UserModel = tenantConnection.model('users')

            //Check for any duplicate user
            const doesUserExist = await UserModel.findOne({ email: payload.email.trim() })
            if (doesUserExist)
                throw new CustomError('Role already exist', 409)

            payload.organisationId = token.organisationId

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

    async login(payload,headers){
        try {
            
        } catch (error) {
            
        }
    }
}

module.exports = new UsersService()