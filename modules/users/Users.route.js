const UserController = require('./Users.controller')
const router = require('express').Router()

router.post('/', (req, res) =>UserController.createUser(req, res))

router.get('/', (req, res) =>UserController.getUsers(req, res))

module.exports = router