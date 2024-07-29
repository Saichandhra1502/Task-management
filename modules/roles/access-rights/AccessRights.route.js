const AccessRightsController = require('./AccessRights.controller')
const route = require('express').Router()
const AuthMiddleware=require('../../../middleware/Auth.middleware')

route.post('/',(req,res,next)=>AuthMiddleware.authenticate(req,res,next),(req, res) => AccessRightsController.createAccessRights(req, res))

module.exports = route;