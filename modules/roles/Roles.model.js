const mongoose = require('mongoose')

const RolesSchema = new mongoose.Schema({
    name: {
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
    accessRights: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'access-rights'
    }],
    organisationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organisations'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }
}, { timestamps: 1 })

const RolesModel = mongoose.model('roles', RolesSchema);


const schemaObj = {
    name: 'roles',
    schema: RolesSchema
}
module.exports = { RolesModel, schemaObj }