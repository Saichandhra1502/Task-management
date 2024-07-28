const mongoose = require('mongoose')

const AccessRightsSchema = new mongoose.Schema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    code: {
        type: String
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    },
    organisationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organisations'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }
}, { timestamps: 1 })

const schemaObj = {
    name: 'access-rights',
    schema: AccessRightsSchema
}
module.exports = { AccessRightsSchema, schemaObj }