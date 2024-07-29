
class RolesService {

    async createRoles(payload, tenantConnection, token) {
        try {
            const RoleModel = tenantConnection.model('roles')

            //Trim the given role name and convert it to Upper case and store it as code
            payload.code = payload.name.trim().toUpperCase()

            //Check for any duplicate role
            const doesRoleExist = await RoleModel.findOne({ code: payload.code })
            if (doesRoleExist)
                throw new CustomError('Role already exist', 409)

            //Store logged in user id as createdBy
            payload.createdBy = token._id

            //Create role
            await new RoleModel(payload).save()

            return {
                status: true,
                message: 'Role created!'
            }
        } catch (error) {
            console.log(error);
            throw new CustomError(`Error while creating new role ${error.message}`, 500)
        }
    }

    async getRoles(tenantConnection) {
        try {
            const RoleModel = tenantConnection.model('roles')
            //Find all the roles
            const doesRolesExists = await RoleModel.find().populate('createdBy').populate('accessRights')
            if (!doesRolesExists)
                throw new CustomError('Roles not found', 404)

            return {
                status: true,
                message: 'Role restreival success',
                roles: doesRolesExists
            }
        } catch (error) {
            throw new CustomError('Error while fetching roles', 500)
        }
    }
}

module.exports = new RolesService()