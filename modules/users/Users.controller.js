const UsersService=require('./Users.service')

class UserController {
    async createUser(req, res) {
        try {
            const response = await UsersService.createUser(req.body, req.tenantConnection, req.token)
            if (!response)
                return res.status(500).json({
                    status: false,
                    message: 'Error while creating user'
                })
            return res.status(201).json(response)
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error
            })
        }
    }

    async getUsers(req, res) {
        try {
            const response = await UsersService.getUsers( req.tenantConnection,req.query,req.token)
            return res.status(200).json(response)
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error
            })
        }
    }

    async login(req, res) {
        try {
            const response = await UsersService.login( req.body,req.headers)
            return res.status(200).json(response)
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error
            })
        }
    }
}

module.exports = new UserController()