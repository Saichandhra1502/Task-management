const RoleController = require('./Roles.controller')
const router = require('express').Router()

router.post('/',(req, res) => RoleController.createRoles(req, res))

router.get('/',(req, res) => RoleController.getRoles(req, res))

module.exports = router