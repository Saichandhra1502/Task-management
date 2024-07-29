const jwt = require('jsonwebtoken');
const {HTTP_CONSTANTS,COLLECTION_NAMES, COLLECTION_STATUS} = require('../configuration/Constants');
const { getAdminConnection, getTenantDbConnection } = require('../configuration/ConnectionManager');
const USER_CONSTANTS = require('../modules/users/Users.constants');
const CustomError = require('../configuration/CustomError');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Middleware methods of the application
 * @desc contains all the middleware methods of the application.
 * @returns middleware class
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class AuthMiddleware  {

    /**
     * @module AuthMiddleware:authenticate
     * @method authenticate verifies jwt token
     * @description verifies jwt auth token, if error returns unauthorized message
     * @returns passes the middleware to the next method.
     */
    async authenticate(req, res, next) {
        try {
            let tokenHeader = req.headers['authorization'];
            if (tokenHeader) {
                let token = await tokenHeader.split(' ');
                let decoded = jwt.verify(token[1],process.env.JWT_SECRET);
                if (decoded) {
                    const getMasterDBConnection = await getAdminConnection();

                    req.masterConnection = getMasterDBConnection;
                    const OrganisationModelAtMaster=req.masterConnection.model(COLLECTION_NAMES.ORGANISATIONS)
                    const doesOrganisationExist=await OrganisationModelAtMaster.findOne({name:decoded.organisationName,status:COLLECTION_STATUS.ACTIVE})
                    if(!doesOrganisationExist)
                        throw new CustomError('Organisation not found',HTTP_CONSTANTS.NOT_FOUND)

                    let dbConnection = await getTenantDbConnection({name:decoded.organisationName,dbURL:doesOrganisationExist.dbURL});
                    if (dbConnection)
                        req['tenantConnection'] = dbConnection;
                    req.token = decoded;

                    return next();
                } else {
                    return res.status(HTTP_CONSTANTS.UNAUTHORIZED).json({ status: HTTP_CONSTANTS.UNAUTHORIZED, message: USER_CONSTANTS.USER_SESSION_EXPIRED });
                }
            } else {
                return res.status(HTTP_CONSTANTS.UNAUTHORIZED).json({ status: HTTP_CONSTANTS.UNAUTHORIZED, message: USER_CONSTANTS.USER_AUTH_TOKEN_REQUIRED });
            }
        } catch (error) {
            return res.status(HTTP_CONSTANTS.UNAUTHORIZED).json({ status: HTTP_CONSTANTS.UNAUTHORIZED, message: USER_CONSTANTS.USER_SESSION_EXPIRED });
        }
    }
}

module.exports = new AuthMiddleware()