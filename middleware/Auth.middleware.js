const jwt = require('jsonwebtoken');
const {HTTP_STATUS} = require('../configuration/Constants');
const { getAdminConnection, getConnectionByTenant } = require('../configuration/ConnectionManager');
const USER_CONSTANTS = require('../modules/users/Users.constants');

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
            this.logger.info('Inside AuthMiddleware: authenticate method');
            let tokenHeader = req.headers['authorization'];
            if (tokenHeader) {
                let token = await tokenHeader.split(' ');
                let decoded = jwt.verify(token[1],process.env.JWT_SECRET);
                if (decoded) {
                    const getMasterDBConnection = await getAdminConnection();

                    req.masterConnection = getMasterDBConnection;
                    let dbConnection = await getConnectionByTenant(decoded.organisationName);
                    if (dbConnection)
                        req['tenantConnection'] = dbConnection.db;
                    req.token = decoded;

                    return next();
                } else {
                    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ status: HTTP_STATUS.UNAUTHORIZED, message: USER_CONSTANTS.USER_SESSION_EXPIRED });
                }
            } else {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ status: HTTP_STATUS.UNAUTHORIZED, message: USER_CONSTANTS.USER_AUTH_TOKEN_REQUIRED });
            }
        } catch (error) {
            this.logger.error('Inside AuthMiddleware: authenticate method:  Error occured while verifying JWT Token ', error);
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ status: HTTP_STATUS.UNAUTHORIZED, message: USER_CONSTANTS.USER_SESSION_EXPIRED });
        }
    }
}

module.exports = new AuthMiddleware()