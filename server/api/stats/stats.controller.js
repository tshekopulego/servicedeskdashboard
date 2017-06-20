'use strict';
var Rfccall = require('../../api/rfc-calls/rfccall.modal');

// Search RfcCall By change Request Type
/*exports.showRfccallStatsBychangeRequestType = function(req, res) {
	
    Rfccall.find({
		"changeRequestType": "Standard"
	}).count()
	.populate('changeRequestType','requesttypeName')
	.populate('callEvaluationOutcome','evaluationoutcomeName')
	
  .exec(function (err, count) {
		if(err) { return handleError(res, err); }
		return res.json(200, count);
	});
};*/

exports.totalAuthorizedCalls = function(req, res) {
    Rfccall.find({
        changeAuthorized:req.params.changeAuthorized
    }).count()
    
    .exec(function(err, rfccall) {
        if(err) { return handleError(res, err); }
        return res.json(200, rfccall);
    });
};
/*db.getCollection('department').find({departmentName: "ICT"}).count()

// Search Issues By all Evaluation Outcome
exports.showRfccallBycallEvaluationOutcome = function(req, res) {
	Rfccall.find({
		callEvaluationOutcome:req.params.callevaluationoutcome
	}).sort({added:1})
	.populate('changeRequestType','requesttypeName')
	.populate('callEvaluationOutcome','evaluationoutcomeName')
    
    .exec(function (err, rfccall) {
		if(err) { return handleError(res, err); }
		return res.json(200, rfccall);
	});
};*/