'use strict';

var express = require('express');
var controller = require('./rfccall.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/rfccallreport', auth.isAuthenticated(), controller.rfccallReport);
router.get('/:id', auth.isAuthenticated(), controller.show);


router.get('/:changerequesttype/requesttypes', auth.isAuthenticated(), controller.showRfccallBychangeRequestType);

router.get('/:callevaluationoutcome/callEvaluationOutcomes', auth.isAuthenticated(), controller.showRfccallBycallEvaluationOutcome);


router.get('/:changerequesttype/:callevaluationoutcome', auth.isAuthenticated(), controller.searchRfccall);


router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
