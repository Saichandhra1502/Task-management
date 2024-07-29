/**
 * @constant mongoose object relation mapper - orm for database
*/
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

class TenantDatabaseConfiguration  {
	constructor() {

		// If the Node process ends, close the Mongoose connection
		process.on('SIGINT', () => {
			mongoose.connection.close(() => {
				console.log(
					'Mongoose default connection disconnected through app termination'
				);
				process.exit(0);
			});
		});
	}

	initTenantDbConnection = async (DB_URL, dbConnectionOptions, name) => {
		return new Promise((resolve, reject) => {
			try {
				const db = mongoose.createConnection(DB_URL, dbConnectionOptions);
				db.on('error', (err) => {
					console.info('///////////////////////// TENANT DB CONNECTION FAILED!!! /////////////////////////');
					console.error(`Inside TenantJS: initTenantDbConnection method: Error while connecting to tenant database: ${name}: `, err);
					console.info('//////////////////////////////////////////////////////////////////////////////////');
				});
				db.once('open', () => {
					// require all schemas
					const OrganisationModel=require('../modules/organisations/Organisations.model')
					const UserModel=require('../modules/users/Users.model')
					const TaskModel=require('../modules/tasks/Tasks.model')
					const RoleModel=require('../modules/roles/Roles.model')
					const AccessRightModel=require('../modules/roles/access-rights/AccessRights.model')

					db.model(OrganisationModel.schemaObj.name,OrganisationModel.schemaObj.schema)
					db.model(UserModel.schemaObj.name,UserModel.schemaObj.schema)
					db.model(TaskModel.schemaObj.name,TaskModel.schemaObj.schema)
					db.model(RoleModel.schemaObj.name,RoleModel.schemaObj.schema)
					db.model(AccessRightModel.schemaObj.name,AccessRightModel.schemaObj.schema)

					resolve(db);
					console.info(`TENANT DATABASE CONNECTION SUCCESSFUL: ${name}`);
					console.info('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
				}); 
			} catch (error) {
				console.log('Inside TenantJS: initTenantDbConnection method: Error while connecting to tenant database: ', error);
				reject(null);
			}
		});
	};
}

module.exports = new TenantDatabaseConfiguration();
