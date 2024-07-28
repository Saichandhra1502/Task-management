const OrganisationService = require('./Organisations.service')

class OrganisationController {
    async createOrganisation(req, res) {
        try {
            const response = await OrganisationService.createOrganisation(req.body, req.masterConnection)
            if (!response)
                return res.status(500).json({
                    status: false,
                    message: 'Error while creating organisation'
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

module.exports = new OrganisationController()
