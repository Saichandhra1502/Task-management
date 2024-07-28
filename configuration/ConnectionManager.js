// const { BASE_DB_URI, ADMIN_DB_NAME, SERVER, DATABASE } = require('../config');
const { initAdminDbConnection } = require('./Admin');
const { initTenantDbConnection } = require('./Tenant');

class ConnectionManager  {

    constructor() {
		this.connectionMap;
		this.adminConnection;
	}

	/**
	 * @method ConnectionManager:connectAllDb
	 * @description Create knex instance for all the tenants defined in common database and store in a map.
	 * @returns 
	 */
	connectAllDb = async () => {
		return new Promise(async (resolve, reject) => {
			try {
				let tenants = [];
				console.log(process.env.BASE_DB_URI);
				console.log(process.env.ADMIN_DB_NAME);
				let ADMIN_DB_URI = `${process.env.BASE_DB_URI}/${process.env.ADMIN_DB_NAME}`;

				this.adminDbConnection = await initAdminDbConnection(ADMIN_DB_URI, {
					socketTimeoutMS: 30000,
					// keepAlive: true,
					useNewUrlParser: true,
					useUnifiedTopology: true,
					maxPoolSize: 100,
					serverSelectionTimeoutMS: 5000
				});

				if (!this.adminDbConnection) {
					throw new CustomError('Error while connecting to master database', HTTP_STATUS.INTERNAL_SERVER_ERROR);
				}
				
				tenants = await this.getOrganisation(this.adminDbConnection);
				console.log(tenants);
				let connections = {};
				for (let i = 0; i < tenants.length; i++) {
					let tenantDBURI = tenants[i]['dbURI'];
					try {
						console.log(`Inside ConnectionManager: connectAllDb method: Connecting to Tenant DB ${tenants[i].name}`)
						let tenantDBConnection = await initTenantDbConnection(tenantDBURI, {
							socketTimeoutMS: 30000,
							// keepAlive: true,
							useNewUrlParser: true,
							useUnifiedTopology: true,
							maxPoolSize: 100,
							serverSelectionTimeoutMS: 5000
						});

						if (tenantDBConnection) connections[tenants[i]['organisationName']] = tenantDBConnection;
					} catch (error) {
						console.error(`Inside ConnectionManager: connectAllDb method: Error while fetching connection for the tenant: ${connections[tenants[i]['organisationName']]}`, error);
					}
				}
				this.connectionMap = connections;
				resolve(this.adminDbConnection);
			} catch (error) {
				console.error('Inside ConnectionManager: connectAllDb method: Error while connecting to all the DB: ', error);
				reject(null);
			}
		});
	};

	/**
	 * @method ConnectionManager:getTenantDbConnection
	 * @param {*} tenant 
	 * @returns 
	 */
	getTenantDbConnection = async (tenant) => {
		console.log('Inside ConnectionManager: getTenantDbConnection method');
		try {
			if (!tenant) return null;
			const conn = await initTenantDbConnection(tenant.dbURL);
			if (conn) {
				this.connectionMap[tenant.organisationName] = conn;
				return this.connectionMap[tenant.organisationName];
			} else {
				await this.connectAllDb();
				const conn = await initTenantDbConnection(tenant.dbURL);
				if (conn) {
					this.connectionMap[tenant.organisationName] = conn;
					return this.connectionMap[tenant.organisationName];
				}
			}
		} catch (error) {
			console.log('Inside ConnectionManager: getTenantDbConnection method : Error: ', error);
		}
	};

	
	/**
	 * @method ConnectionManager:getAdminConnection
	 * @description Get master database connection
	 * @returns 
	 */
	getAdminConnection = () => {
		console.log('Inside ConnectionManager: getAdminConnection method');
		if (this.adminDbConnection) {
			return this.adminDbConnection;
		}
		return null;
	};

	async getOrganisation(masterConnection) {
        try {
            const OrganisationModelAtMaster = masterConnection.model(COLLECTION_NAMES.ORGANISATIONS)
            const doesOrganisationsExist = await OrganisationModelAtMaster.find()

           return doesOrganisationsExist
        } catch (error) {
            throw new CustomError(`Error while fetching organisations,${error}`, 500)
        }
    }
}

module.exports=new ConnectionManager()