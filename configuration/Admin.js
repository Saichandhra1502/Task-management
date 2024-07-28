const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

class AdminDatabaseConfiguration {

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

	initAdminDbConnection = async (DB_URL, dbConnectionOptions) => {
		return new Promise((resolve, reject) => {
			try {
				const db = mongoose.createConnection(DB_URL, dbConnectionOptions);
				db.on('error', (err) => {
					console.info('///////////////////////// MASTER DB CONNECTION FAILED!!! /////////////////////////');
					console.error(`Inside AdminJS: initAdminDbConnection method: Error while connecting to master database: ${DB_URL}: `, err);
					console.info('//////////////////////////////////////////////////////////////////////////////////');
				});
				db.once('open', () => {
					// require all schemas !?
					let OrganisationsModel = require('../modules/organisations/Organisations.model');
				
					db.model(OrganisationsModel.schemaObj.name, OrganisationsModel.schemaObj.schema);

					console.info('***************************************************************');
					console.info('\t\tMASTER DATABASE CONNECTION SUCCESSFUL');
					console.info('***************************************************************');
					resolve(db);
				});
			} catch (error) {
				console.log('Inside AdminJS: initAdminDbConnection method: Error while connecting to master database: ', error);
				reject(null);
			}
		});
	};
}

module.exports = new AdminDatabaseConfiguration();