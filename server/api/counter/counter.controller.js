'use strict';

var _ = require('lodash');
var Counter = require('./counter.model');

// Get list of Counter
exports.index = function(req, res) {
	Counter.find()
    .exec(function (err, counters) {
		if(err) { return handleError(res, err); }       
		return res.json(200, counters);
	});
};

// Get a single Counter
exports.show = function(req, res) {
	Counter.findById(req.params.id, function (err, counter) {
		if(err) { 
            return handleError(res, err); 
        }
		if(!counter) { return res.send(404); }
		return res.json(counter);
	});
};

// Creates a new Counter in the DB.
exports.create = function(req, res) {
	Counter.create(req.body, function(err, counter) {
		if(err) { return handleError(res, err); }
		return res.json(201, counter);
	});
};

// Updates an existing Counter in the DB.
exports.update = function(req, res) {
	if(req.body._id) { delete req.body._id; }
	Counter.findById(req.params.id, function (err, counter) {
		if (err) { return handleError(res, err); }
		if(!counter) { return res.send(404); }
		var updated = _.merge(counter, req.body);
		updated.save(function (err) {
			if (err) { return handleError(res, err); }
			return res.json(200, counter);
		});
	});
};

// Deletes a Counter from the DB.
exports.destroy = function(req, res, config) {
	Counter.findById(req.params.id, function (err, counter) {
		if(err) { return handleError(res, err); }
		if(!counter) { return res.send(404); }
		if(config.env != 'demo') {
			counter.remove(function(err) {
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
