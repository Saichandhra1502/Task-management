const AccessRightsService = require('./AccessRights.service')

class AccessRightsController {
    async createAccessRights(req, res) {
        try {
            const response = await AccessRightsService.createAccessRights(req.body, req.tenantConnection, req.token)
            if (!response)
                return res.status(500).json({
                    status: false,
                    message: 'Error while creating access right'
                })
            return res.status(201).json(response)
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error
            })
        }
    }
}

module.exports = new AccessRightsController()
