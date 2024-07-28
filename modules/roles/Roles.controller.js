const RolesService=require('./Roles.service')

class RoleController {
    async createRoles(req, res) {
        try {
            const response = await RolesService.createRoles(req.body, req.tenantConnection, req.token)
            if (!response)
                return res.status(500).json({
                    status: false,
                    message: 'Error while creating role'
                })
            return res.status(201).json(response)
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error
            })
        }
    }

    async getRoles(req, res) {
        try {
            const response = await RolesService.getRoles( req.tenantConnection)
            return res.status(200).json(response)
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error
            })
        }
    }
}

module.exports = new RoleController()