const express = require('express');
const routes = express.Router();
const userAppointments = require('../controllers/userAppointments');
const userAuthentication = require('../middleware/auth')

routes.get('/getServices', userAuthentication.authenticate, userAppointments.getServices);
 
module.exports = routes;