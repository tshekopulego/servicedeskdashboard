'use strict';

var _ = require('lodash');
var IssueStatus = require('./issuestatus.model');

// Get list of category
exports.index = function(req, res) {
	IssueStatus.find(function (err, issuestatus) {
		if(err) { return handleError(res, err); }
		return res.json(200, issuestatus);
	});
};

// Get a single category
exports.show = function(req, res) {
	IssueStatus.findById(req.params.id, function (err, issuestatus) {
		if(err) { return handleError(res, err); }
		if(!issuestatus) { return res.send(404); }
		return res.json(issuestatus);
	});
};

// Creates a new category in the DB.
exports.create = function(req, res) {
	IssueStatus.create(req.body, function(err, issuestatus) {
		if(err) { return handleError(res, err); }
		return res.json(201, issuestatus);
	});
};

// Updates an existing category in the DB.
exports.update = function(req, res) {
	if(req.body._id) { delete req.body._id; }
	IssueStatus.findById(req.params.id, function (err, issuestatus) {
		if (err) { return handleError(res, err); }
		if(!issuestatus) { return res.send(404); }
		var updated = _.merge(issuestatus, req.body);
		updated.save(function (err) {
			if (err) { return handleError(res, err); }
			return res.json(200, issuestatus);
		});
	});
};

// Deletes a category from the DB.
exports.destroy = function(req, res) {
	IssueStatus.findById(req.params.id, function (err, issuestatus) {
		if(err) { return handleError(res, err); }
		if(!issuestatus) { return res.send(404); }
		if(config.env != 'demo') {
			issuestatus.remove(function(err) {
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
