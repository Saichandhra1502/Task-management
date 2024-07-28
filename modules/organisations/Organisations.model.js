const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid');


const OrganisationSchema = new mongoose.Schema({
    name:{
        type:String
    },
    description:{
        type:String
    },
    status:{
        type:String,
        enum:['ACTIVE','INACTIVE'],
        default:'ACTIVE'
    },
    dbURL:{
        type:String
    },
    uuid: {
		type: String,
		default: () => uuidv4(),
	},
}, { timestamps: 1 })

const schemaObj = {
    name: 'organisations',
    schema: OrganisationSchema
}
module.exports = { OrganisationSchema, schemaObj }