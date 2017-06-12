'use strict';

var _ = require('lodash');
var Role = require('./role.modal');

// Get list of Roles
exports.index = function(req, res) {
	Role.find()
    .populate('userLastName','firstName')
    .populate('departmentName','departmentName')
    .exec(function (err, roles) {
		if(err) { return handleError(res, err); }       
		return res.json(200, roles);
	});
};

// Get a single Role
exports.show = function(req, res) {
	Role.findById(req.params.id, function (err, role) {
		if(err) { 
            return handleError(res, err); 
        }
		if(!role) { return res.send(404); }
		return res.json(role);
	});
};

// Creates a new Role in the DB.
exports.create = function(req, res) {
	Role.create(req.body, function(err, role) {
		if(err) { return handleError(res, err); }
		return res.json(201, role);
	});
};

// Updates an existing Role in the DB.
exports.update = function(req, res) {
	if(req.body._id) { delete req.body._id; }
	Role.findById(req.params.id, function (err, role) {
		if (err) { return handleError(res, err); }
		if(!role) { return res.send(404); }
		var updated = _.merge(role, req.body);
		updated.save(function (err) {
			if (err) { return handleError(res, err); }
			return res.json(200, role);
		});
	});
};

// Deletes a Role from the DB.
exports.destroy = function(req, res, config) {
	Role.findById(req.params.id, function (err, role) {
		if(err) { return handleError(res, err); }
		if(!role) { return res.send(404); }
		if(config.env != 'demo') {
			role.remove(function(err) {
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
