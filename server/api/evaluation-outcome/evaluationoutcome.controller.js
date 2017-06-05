'use strict';

var _ = require('lodash');
var EvaluationOutcome = require('./evaluationoutcome.model');

// Get list of evaluationoutcome
exports.index = function(req, res) {
	EvaluationOutcome.find(function (err, evaluationoutcomes) {
		if(err) { return handleError(res, err); }
		return res.json(200, evaluationoutcomes);
	});
};

// Get a single evaluationoutcome
exports.show = function(req, res) {
	EvaluationOutcome.findById(req.params.id, function (err, evaluationoutcome) {
		if(err) { return handleError(res, err); }
		if(!evaluationoutcome) { return res.send(404); }
		return res.json(evaluationoutcome);
	});
};

// Creates a new evaluationoutcome in the DB.
exports.create = function(req, res) {
	EvaluationOutcome.create(req.body, function(err, evaluationoutcome) {
		if(err) { return handleError(res, err); }
		return res.json(201, evaluationoutcome);
	});
};

// Updates an existing evaluationoutcome in the DB.
exports.update = function(req, res) {
	if(req.body._id) { delete req.body._id; }
	EvaluationOutcome.findById(req.params.id, function (err, evaluationoutcome) {
		if (err) { return handleError(res, err); }
		if(!evaluationoutcome) { return res.send(404); }
		var updated = _.merge(evaluationoutcome, req.body);
		updated.save(function (err) {
			if (err) { return handleError(res, err); }
			return res.json(200, evaluationoutcome);
		});
	});
};

// Deletes a evaluationoutcome from the DB.
exports.destroy = function(req, res) {
	EvaluationOutcome.findById(req.params.id, function (err, evaluationoutcome) {
		if(err) { return handleError(res, err); }
		if(!evaluationoutcome) { return res.send(404); }
        evaluationoutcome.remove(function(err) {
				if(err) {
                    return handleError(res, err); }
				return res.send(204);
			});
	});
};

function handleError(res, err) {
	return res.send(500, err);
}
