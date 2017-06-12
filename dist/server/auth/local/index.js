'use strict';

var express = require('express');
var controller = require('./local.controller');
var auth = require('../auth.service');
var router = express.Router();

router.get('/mailconfirmation', auth.isAuthenticated(), controller.sendMailAdressConfirmationMail);
router.get('/passwordreset', controller.resetPassword);
router.post('/passwordreset', controller.confirmResetedPassword);
router.post('/', controller.root);

module.exports = router;
