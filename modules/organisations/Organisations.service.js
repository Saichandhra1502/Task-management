
const { getTenantDbConnection, connectAllDb } = require('../../configuration/ConnectionManager')
const { COLLECTION_NAMES } = require('../../configuration/Constants')
class OrganisationsService {

    async createOrganisation(payload, masterConnection) {
        try {
            const OrganisationModelAtMaster = masterConnection.model(COLLECTION_NAMES.ORGANISATIONS)

            //Check for any duplicate organisation
            const doesOrganisationExist = await OrganisationModelAtMaster.findOne({ name: payload.name })
            if (doesOrganisationExist)
                throw new CustomError('Organisation already exist with same name', 409)

            //create dbUrl and store in organisations schema
            payload.dbURL = `${BASE_DB_URI}/tnt_${payload.name.trim().toLowercase()}`

            //Create organisation
            const doesOrganisationCreated = await new OrganisationModelAtMaster(payload).save()

            //Get tenant DB Connection
            let connection = await getTenantDbConnection({ organisationName: doesOrganisationCreated.name, dbURL: doesOrganisationCreated.dbURL });
            let tenantDBConnection = (connection && connection.db) ? connection.db : null;
            setTimeout(async () => {
                if (tenantDBConnection) {
                    //Create Entity at Tenant DB
                    payload.uuid = doesOrganisationCreated.uuid;
                    let OrganisationModelAtTenant = tenantDBConnection.model(COLLECTION_NAMES.ORGANISATIONS);
                    await new OrganisationModelAtTenant(payload).save();

                    // Reload database connection map
                    connectAllDb();
                }
            }, 1000);

            return {
                status: true,
                message: 'Organisation created!'
            }
        } catch (error) {
            throw new CustomError('Error while creating new organisation', 500)
        }
    }

    async getOrganisation(masterConnection) {
        try {
            const OrganisationModelAtMaster = masterConnection.model(COLLECTION_NAMES.ORGANISATIONS)
            const doesOrganisationsExist = await OrganisationModelAtMaster.find()


            return {
                status: true,
                message: 'Organisations retreival success',
                organisations: doesOrganisationsExist
            }
        } catch (error) {
            throw new CustomError(`Error while fetching organisations,${error}`, 500)
        }
    }
}

module.exports = new OrganisationsService()