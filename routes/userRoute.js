const express = require('express');
const routes = express.Router();
const userControll = require('../controllers/userController');
const userAuthentication = require('../middleware/auth')

routes.post('/signup', userControll.addUser);
routes.post('/login', userControll.login);
routes.get('/profile', userAuthentication.authenticate, userControll.getProfile);

module.exports = routes;