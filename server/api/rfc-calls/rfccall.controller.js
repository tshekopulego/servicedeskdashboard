'use strict';

var _ = require('lodash');
var Rfccall = require('./rfccall.modal');

// Get list of RFC Calls
exports.index = function(req, res) {
	Rfccall.find()
    .populate('changeRequestType','requesttypeName')
    .populate('callEvaluationOutcome','evaluationoutcomeName')
    .exec(function (err, rfccalls) {
        var count = Object.keys(rfccalls).length;
        console.log(count);
		if(err) { return handleError(res, err); }       
		return res.json(200, rfccalls);
	});
};

// Get a single RFC Call
exports.show = function(req, res) {
	Rfccall.findById(req.params.id, function (err, rfccall) {
		if(err) { 
            return handleError(res, err); 
        }
		if(!rfccall) { return res.send(404); }
		return res.json(rfccall);
	});
};

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

function handleError(res, err) {
	return res.send(500, err);
}
