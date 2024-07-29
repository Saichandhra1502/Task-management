
const { getTenantDbConnection } = require('../../configuration/ConnectionManager')
const { COLLECTION_NAMES } = require('../../configuration/Constants')
const CustomError = require('../../configuration/CustomError')
class OrganisationsService {

    async createOrganisation(payload, masterConnection) {
        try {
            const OrganisationModelAtMaster = masterConnection.model(COLLECTION_NAMES.ORGANISATIONS)

            //Check for any duplicate organisation
            const doesOrganisationExist = await OrganisationModelAtMaster.findOne({ name: payload.name })
            if (doesOrganisationExist)
                throw new CustomError('Organisation already exist with same name', 409)

            //create dbUrl and store in organisations schema
            payload.dbURL = `${process.env.BASE_DB_URI}/tnt_${payload.name.toLowerCase()}`

            //Create organisation
            const doesOrganisationCreated = await new OrganisationModelAtMaster(payload).save()

            //Get tenant DB Connection
            let connection = await getTenantDbConnection({ name: doesOrganisationCreated.name, dbURL: doesOrganisationCreated.dbURL });

            let tenantDBConnection = connection

            //Create Entity at Tenant DB
            payload.uuid = doesOrganisationCreated.uuid;
            let OrganisationModelAtTenant = tenantDBConnection.model(COLLECTION_NAMES.ORGANISATIONS);
            const doesOrganisationCreatedAtTenant = await new OrganisationModelAtTenant(payload).save();

            return {
                status: true,
                message: 'Organisation created!',
                tenant: tenantDBConnection,
                oragnisationId: doesOrganisationCreatedAtTenant._id
            }
        } catch (error) {
            throw new CustomError('Error while creating new organisation', 500)
        }
    }
}

module.exports = new OrganisationsService()