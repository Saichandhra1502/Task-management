class AccessRightsService {

    async createAccessRights(payload, tenantConnection,token) {
        try {
            const AccessRightsModel = tenantConnection.model('access-rights')

            //Check any for duplicate access right 
            const doesAccessRightsExits = await AccessRightsModel.findOne({ code: payload.code })
            if (doesAccessRightsExits)
                throw new CustomError('Access right already exist', 409)

            //Store logged in users id as createdBy
            payload.createdBy = token._id

            //Create access right
            await new AccessRightsModel(payload).save()

            return {
                status: true,
                message: 'Access right created!'
            }
        } catch (error) {
            throw new CustomError('Error while creating new access right',500)
        }
    }
}

module.exports = new AccessRightsService()