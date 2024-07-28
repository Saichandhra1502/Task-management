const express = require('express')
const bodyParser = require('body-parser')
const {connectAllDb}=require('./configuration/ConnectionManager')
require('dotenv').config();

const routes = require('./routes')

//Create a server using express
const app = express()

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use('/api', routes)

connectAllDb()

app.listen(4000, () => {
    console.log(`App is listening to 4000`)
})

module.exports = app
