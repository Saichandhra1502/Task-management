
const { COLLECTION_NAMES } = require('../../../configuration/Constants')

class UserHierarchyService {

    async createUserHierarchy(payload, tenantDBConnection, token) {
        try {

            payload.organisationId = token.organisationId
            const UserHierarchyModel = tenantDBConnection.model(COLLECTION_NAMES.USER_HIERARCHY)
            await new UserHierarchyModel(payload).save()

            return {
                status: true,
                message: 'User hierarchy created successfully.'
            }
        } catch (error) {
            throw new CustomError(`Error while creating user hierarchy ${error}`, 500)
        }
    }
}

module.exports = new UserHierarchyService()