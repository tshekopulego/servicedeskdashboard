'use strict';

var _ = require('lodash');
var Issue = require('./issue.model');

// Get list of visitors
exports.index = function(req, res) {
	Issue.find()
    .populate('issueCategory','categoryName')
    .populate('issueStatus','issueStatusName')
    .exec(function (err, issues) {
		if(err) { return handleError(res, err); }
		return res.json(200, issues);
	});
};

// Get a single issue
exports.show = function(req, res) {
	Issue.findById(req.params.id, function (err, issue) {
		if(err) { return handleError(res, err); }
		if(!issue) { return res.send(404); }
		return res.json(issue);
	});
};

// Creates a new issue in the DB.
exports.create = function(req, res) {
	Issue.create(req.body, function(err, issue) {
		if(err) { return handleError(res, err); }
		return res.json(201, issue);
	});
};

// Updates an existing issue in the DB.
exports.update = function(req, res) {
	if(req.body._id) { delete req.body._id; }
	Issue.findById(req.params.id, function (err, issue) {
		if (err) { return handleError(res, err); }
		if(!issue) { return res.send(404); }
		var updated = _.merge(issue, req.body);
		updated.save(function (err) {
			if (err) { return handleError(res, err); }
			return res.json(200, issue);
		});
	});
};

// Deletes a issue from the DB.
exports.destroy = function(req, res) {
	Issue.findById(req.params.id, function (err, issue) {
		if(err) { return handleError(res, err); }
		if(!issue) { return res.send(404); }
		if(config.env != 'demo') {
			issue.remove(function(err) {
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
