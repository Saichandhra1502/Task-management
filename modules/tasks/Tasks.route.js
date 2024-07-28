const TaskController = require('./Tasks.controller')
const router = require('express').Router()

router.post('/',(req, res) => TaskController.createTask(req, res))

router.get('/', (req, res) =>TaskController.getTasks(req, res))

module.exports = router