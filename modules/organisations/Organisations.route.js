const OrganisationController = require('./Organisation.controller')
const router = require('express').Router()

router.post('/', (req, res) => OrganisationController.createOrganisation(req, res))


module.exports = router