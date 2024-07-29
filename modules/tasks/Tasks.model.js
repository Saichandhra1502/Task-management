const mongoose = require('mongoose')

const TasksSchema = new mongoose.Schema({
    title: {
        type: String
    },
    description: {
        type: String,
        trim: true
    },
    dueDate: {
        type: Date
    },
    type: {
        type: String,
        enum: ['CALL', 'EMAIL', 'MEETING']
    },
    status: {
        type: String,
        enum: ['PENDIND', 'IN-PROGRESS', 'COMPLETED'],
        default: 'PENDIND'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    organisationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organisations'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH']
    },
    completedDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

const TaskModel = mongoose.model('tasks', TasksSchema);


const schemaObj = {
    name: 'tasks',
    schema: TasksSchema
}
module.exports = { TaskModel, schemaObj }