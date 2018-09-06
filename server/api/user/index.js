'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.get('/clients', controller.clients);
router.get('/client/:id', controller.client);
router.put('/:id/password', controller.changePassword);
router.put('/:id', auth.isAuthenticated(), controller.updateUser);
router.get('/:id', controller.show);
router.post('/', controller.createGuest);
router.put('/', controller.createUser);
router.get('/userD/:id', controller.showUser);
router.post('/register-client', controller.registerClient);

module.exports = router;
