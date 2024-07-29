const UserController = require('./Users.controller')
const AuthMiddleware=require('../../middleware/Auth.middleware')
const router = require('express').Router()

router.post('/admin', (req, res) =>UserController.createAdminUser(req, res))

router.post('/',(req,res,next)=>AuthMiddleware.authenticate(req,res,next), (req, res) =>UserController.createUser(req, res))

router.get('/', (req, res) =>UserController.getUsers(req, res))

router.post('/login', (req, res) =>UserController.login(req, res))


module.exports = router