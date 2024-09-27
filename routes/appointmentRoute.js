const express = require('express');
const routes = express.Router();
const userAppointments = require('../controllers/userAppointments');
const userAuthentication = require('../middleware/auth')

routes.post('/appointment', userAuthentication.authenticate, userAppointments.bookAppointments);

routes.get('/getAppointments', userAuthentication.authenticate, userAppointments.getAppointments);
routes.get('/getOpenSlots', userAuthentication.authenticate, userAppointments.getOpenSlots);
routes.get('/getOpenSlots', userAuthentication.authenticate, userAppointments.getOpenSlots);

routes.delete('/cancelAppointment/:id/:slotId', userAuthentication.authenticate, userAppointments.cancelAppointment);

module.exports = routes;