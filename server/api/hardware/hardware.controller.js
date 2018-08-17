'use strict';

var _ = require('lodash');
var Hardware = require('./hardware.model');

// Get list of Hardware
exports.index = function (req, res) {
    Hardware.find(function (err, hardwares) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, hardwares);
    });
};

// Get a single Hardware
exports.show = function (req, res) {
    Hardware.findById(req.params.id, function (err, hardware) {
        if (err) {
            return handleError(res, err);
        }
        if (!hardware) {
            return res.send(404);
        }
        return res.json(hardware);
    });
};

// Creates a new Hardware in the DB.
exports.create = function (req, res) {
    Hardware.create(req.body, function (err, hardware) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, hardware);
    });
};

// Updates an existing Hardware in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Hardware.findById(req.params.id, function (err, hardware) {
        if (err) {
            return handleError(res, err);
        }
        if (!hardware) {
            return res.send(404);
        }
        var updated = _.merge(hardware, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, hardware);
        });
    });
};

// Deletes a Hardware from the DB.
exports.destroy = function (req, res) {
    Hardware.findById(req.params.id, function (err, hardware) {
        if (err) {
            return handleError(res, err);
        }

        if (!hardware) {
            return res.send(404);
        }

        hardware.remove(function (err) {
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