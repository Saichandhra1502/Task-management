const TaskController = require('./Tasks.controller')
const router = require('express').Router()
const AuthMiddleware=require('../../middleware/Auth.middleware')

router.post('/',(req,res,next)=>AuthMiddleware.authenticate(req,res,next),(req, res) => TaskController.createTask(req, res))

router.get('/', (req,res,next)=>AuthMiddleware.authenticate(req,res,next),(req, res) =>TaskController.getTasks(req, res))

module.exports = router