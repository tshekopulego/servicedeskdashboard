'use strict';

var _ = require('lodash');
var Division = require('./division.model');

// Get list of division
exports.index = function (req, res) {
    Division.find(function (err, divisions) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, divisions);
    });
};

// Get a single division
exports.show = function (req, res) {
    Division.findById(req.params.id, function (err, division) {
        if (err) {
            return handleError(res, err);
        }
        if (!division) {
            return res.send(404);
        }
        return res.json(division);
    });
};

// Creates a new division in the DB.
exports.create = function (req, res) {
    Division.create(req.body, function (err, division) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, division);
    });
};

// Updates an existing division in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Division.findById(req.params.id, function (err, division) {
        if (err) {
            return handleError(res, err);
        }
        if (!division) {
            return res.send(404);
        }
        var updated = _.merge(division, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, division);
        });
    });
};

// Deletes a division from the DB.
exports.destroy = function (req, res) {
    Division.findById(req.params.id, function (err, division) {
        if (err) {
            return handleError(res, err);
        }

        if (!division) {
            return res.send(404);
        }

        division.remove(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.send(204);
        });
    });
};

function handleError(res, err) {
    return res.send(500, err);
}