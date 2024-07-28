const UserRoutes = require('./modules/users/Users.route')
const OrganisationRoutes = require('./modules/organisations/Organisations.route')
const RoleRoutes = require('./modules/roles/Roles.route')
const TaskRoutes = require('./modules/tasks/Tasks.route')
const AccessRightRoutes = require('./modules/roles/access-rights/AccessRights.route')
const router=require('express').Router()

router.use('/users',UserRoutes)
router.use('/organisations',OrganisationRoutes)
router.use('/roles',RoleRoutes)
router.use('/tasks',TaskRoutes)
router.use('/access-rights',AccessRightRoutes)

module.exports=router;
