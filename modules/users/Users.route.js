const UserController = require('./Users.controller')
const router = require('express').Router()

router.post('/', (req, res) =>UserController.createUser(req, res))

router.get('/', (req, res) =>UserController.getUsers(req, res))

router.post('/login', (req, res) =>UserController.login(req, res))


module.exports = router