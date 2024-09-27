const express = require('express');
const routes = express.Router();
const adminControll = require('../controllers/adminController');
const userAuthentication = require('../middleware/auth')

routes.post('/signup', adminControll.addAdmin);
routes.post('/login', adminControll.adminLogin);
routes.post('/addServices', userAuthentication.authenticateAdmin, adminControll.addServices);
routes.post('/addSlot', userAuthentication.authenticateAdmin, adminControll.addSlot);

routes.get('/getServices', userAuthentication.authenticateAdmin, adminControll.getServices);
routes.get('/getUsers', userAuthentication.authenticateAdmin, adminControll.getUsersList);
routes.get('/getAppointments', userAuthentication.authenticateAdmin, adminControll.getUsersAppointments);
//routes.get('/editUser/:userId', userAuthentication.authenticateAdmin, adminControll.editUser);
routes.get('/getSlots', userAuthentication.authenticateAdmin, adminControll.getSlots);

//routes.put('/saveEditedUser/:userId', userAuthentication.authenticateAdmin, adminControll.saveEditedUser);

routes.delete('/removeUser/:userId', userAuthentication.authenticateAdmin, adminControll.removeUser);
//routes.delete('/cancelAppointment/:appointmentId', userAuthentication.authenticateAdmin, adminControll.cancelAppointment);
routes.delete('/deleteService/:serviceId', userAuthentication.authenticateAdmin, adminControll.deleteService);
routes.delete('/deleteSlot/:slotId', userAuthentication.authenticateAdmin, adminControll.deleteSlot);


module.exports = routes;

