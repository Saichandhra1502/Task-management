const AccessRightsController = require('./AccessRights.controller')
const route = require('express').Router()

route.post('/',(req, res) => AccessRightsController.createAccessRights(req, res))

module.exports = route