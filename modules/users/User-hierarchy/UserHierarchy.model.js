const mongoose = require('mongoose')

const UserHierarchySchema = new mongoose.Schema({
    childUserId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    parentUserId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    },
    organisationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organisations'
    }
}, { timestamps: 1 })

const schemaObj = {
    name: 'user-hierarchies',
    schema: UserHierarchySchema
}
module.exports = { UserHierarchySchema, schemaObj }