const mongoose = require('mongoose')

const UsersSchema = new mongoose.Schema({
    fullName: {
        type: String
    },
    contact: {
        type: String
    },
    countryCode: {
        type: STring
    },
    email: {
        type: String,
        trim:trim
    },
    password: {
        type: String
    },
    organisationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organisations'
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default:'ACTIVE'
    }
}, { timestamps: 1 })

const UsersModel = mongoose.model('users', UsersSchema);


const schemaObj = {
    name: 'users',
    schema: UsersSchema
}
module.exports = { UsersModel, schemaObj }