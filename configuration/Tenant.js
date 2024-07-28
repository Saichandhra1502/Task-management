/**
 * @constant mongoose object relation mapper - orm for database
*/
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const glob = require('glob');

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
				db.on('error', () => {
					console.info('///////////////////////// TENANT DB CONNECTION FAILED!!! /////////////////////////');
					console.error(`Inside TenantJS: initTenantDbConnection method: Error while connecting to tenant database: ${name}: `, err);
					console.info('//////////////////////////////////////////////////////////////////////////////////');
				});
				db.once('open', () => {
					// require all schemas
					glob('modules/**/*model.js', function (err, files) {
						if (err) {
							console.log(err);
						}
						if (files && files.length > 0) {
							files.forEach((file) => {
								const schemaFile = require(`../../../${file}`);
								if (schemaFile && schemaFile.model)
									db.model(schemaFile.model['name'], schemaFile.model['schema']);
							});
						}
					});

					resolve(responseObject);
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
