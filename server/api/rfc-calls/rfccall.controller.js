'use strict';

var _ = require('lodash');
var Rfccall = require('./rfccall.modal');

// Get list of RFC Calls
exports.index = function(req, res) {
	Rfccall.find()
    .populate('changeRequestType','requesttypeName')
    .populate('callEvaluationOutcome','evaluationoutcomeName')
    .exec(function (err, rfccalls) {
		if(err) { return handleError(res, err); }       
		return res.json(200, rfccalls);
	});
};


// Get a single RFC call
exports.show = function(req, res) {
	Rfccall.findById({
		_id:req.params.id
	}).sort({added:1})
	.populate('changeRequestType','requesttypeName')
	.populate('callEvaluationOutcome','evaluationoutcomeName')
	
	.exec(function (err, rfccalls) {
	if(err) { return handleError(res, err); }
	return res.json(200, rfccalls)
});
};


// Get a single RFC Call
//exports.show = function(req, res) {
//	Rfccall.findById(req.params.id, function (err, rfccall) {
//		if(err) { 
//            return handleError(res, err); 
//        }
//		if(!rfccall) { return res.send(404); }
//		return res.json(rfccall);
//	});
//};

// Creates a new RFC Call in the DB.
exports.create = function(req, res) {
	Rfccall.create(req.body, function(err, rfccall) {
		if(err) { return handleError(res, err); }
		return res.json(201, rfccall);
	});
};

// Updates an existing RFC Call in the DB.
exports.update = function(req, res) {
	if(req.body._id) { delete req.body._id; }
	Rfccall.findById(req.params.id, function (err, rfccall) {
		if (err) { return handleError(res, err); }
		if(!rfccall) { return res.send(404); }
		var updated = _.merge(rfccall, req.body);
		updated.save(function (err) {
			if (err) { return handleError(res, err); }
			return res.json(200, rfccall);
		});
	});
};

// Deletes a RFC Call from the DB.
exports.destroy = function(req, res) {
	Rfccall.findById(req.params.id, function (err, rfccall) {
		if(err) { return handleError(res, err); }
		if(!rfccall) { return res.send(404); }
		if(config.env != 'demo') {
			rfccall.remove(function(err) {
				if(err) { return handleError(res, err); }
				return res.send(204);
			});
		} else {
			res.send(200);
		}
	});
};



// Search IRFC
exports.searchRfccall = function(req, res) {
	Rfccall.find({
		changeRequestType:req.params.changerequesttype,
		callEvaluationOutcome:req.params.callevaluationoutcome
	}).sort({added:1})
	  .populate('changeRequestType','requesttypeName')
	  .populate('callEvaluationOutcome','evaluationoutcomeName')
	 
    .exec(function (err, irfccall) {
		if(err) { return handleError(res, err); }
		return res.json(200, rfccall);
	});
};


// Search Issue By change Request Type
exports.showRfccallBychangeRequestType = function(req, res) {
	Rfccall.find({
		changeRequestType:req.params.changerequesttype
	}).sort({added:1})
	.populate('changeRequestType','requesttypeName')
	.populate('callEvaluationOutcome','evaluationoutcomeName')
	
  .exec(function (err, rfccall) {
		if(err) { return handleError(res, err); }
		return res.json(200, rfccall);
	});
};


// Search Issues By all Evaluation Outcome
exports.showRfccallBycallEvaluationOutcome = function(req, res) {
	Issue.find({
		callEvaluationOutcome:req.params.callevaluationoutcome
	}).sort({added:1})
	.populate('changeRequestType','requesttypeName')
	.populate('callEvaluationOutcome','evaluationoutcomeName')
    
    .exec(function (err, rfccall) {
		if(err) { return handleError(res, err); }
		return res.json(200, rfccall);
	});
};




function handleError(res, err) {
	return res.send(500, err);
}
