const { COLLECTION_NAMES, HTTP_CONSTANTS } = require('../../configuration/Constants')
class TaskService {

    async createTask(payload, tenantConnection, token) {
        try {
            const TaskModel = tenantConnection.model(COLLECTION_NAMES.TASKS)

            payload.dueDate = new Date(payload.dueDate)
            payload.assignedTo = token._id
            payload.organisationId = token.organisationId

            await new TaskModel(payload).save()

            return {
                status: true,
                message: 'Task created successfully.'
            }

        } catch (error) {
            throw new CustomError(`Error while creating new task ${error.message}`, 500)
        }
    }

    async getTasks(token, tenantConnection) {
        try {
            const TaskModel = tenantConnection.model(COLLECTION_NAMES.TASKS)
            const page = query.offset ? parseInt(query.offset) : 0;
            const pagination = query.limit ? parseInt(query.limit) : 10;

            let searchQuery = {
                organisationId: token.organisationId
            }

            const doesTasksExist = await TaskModel
                .find(searchQuery)
                .sort({ 'dueDate': -1 })
                .skip((page) * pagination)
                .limit(pagination)
            const countOfTasks = await TaskModel.count(searchQuery)

            return {
                status: true,
                message: 'Tasks retreival success',
                tasksList: doesTasksExist,
                count:countOfTasks
            }
        } catch (error) {
            throw new CustomError(`Error while fetching tasks ${error.message}`, 500)
        }
    }
}

module.exports = new TaskService()