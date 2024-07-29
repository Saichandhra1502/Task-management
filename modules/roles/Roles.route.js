const RoleController = require('./Roles.controller')
const router = require('express').Router()
const AuthMiddleware=require('../../middleware/Auth.middleware')

router.post('/',(req,res,next)=>AuthMiddleware.authenticate(req,res,next),(req, res) => RoleController.createRoles(req, res))

router.get('/',(req,res,next)=>AuthMiddleware.authenticate(req,res,next),(req, res) => RoleController.getRoles(req, res))

module.exports = router