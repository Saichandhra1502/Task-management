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

const AccessRightsModel = mongoose.model('access-rights', AccessRightsSchema);


const schemaObj = {
    name: 'access-rights',
    schema: AccessRightsSchema
}
module.exports = { AccessRightsModel, schemaObj }