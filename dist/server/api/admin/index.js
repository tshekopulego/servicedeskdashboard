'use strict';

var express = require('express');
var controller = require('./admin.controller');

var router = express.Router();

router.get('/restore-latest-backup', controller.restoreDB);

module.exports = router;
