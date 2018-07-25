'use strict';

var _ = require('lodash');
var Costcenter = require('./costcenter.model');

// Get list of costcenters
exports.index = function (req, res) {
    Costcenter.find(function (err, costcenters) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, costcenters);
    });
};

// Get a single costcenter
exports.show = function (req, res) {
    Costcenter.findById(req.params.id, function (err, costcenters) {
        if (err) {
            return handleError(res, err);
        }
        if (!costcenter) {
            return res.send(404);
        }
        return res.json(costcenters);
    });
};

// Creates a new costcenter in the DB.
exports.create = function (req, res) {
    Costcenter.create(req.body, function (err, costcenters) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, costcenters);
    });
};

// Updates an existing costcenters in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Costcenter.findById(req.params.id, function (err, costcenters) {
        if (err) {
            return handleError(res, err);
        }
        if (!costcenter) {
            return res.send(404);
        }
        var updated = _.merge(costcenter, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, costcenters);
        });
    });
};

// Deletes a assettype from the DB.
exports.destroy = function (req, res) {
    Costcenter.findById(req.params.id, function (err, costcenter) {

        if (err) {
            return handleError(res, err);
        }

        if (!costcenter) {
            return res.send(404);
        }

        costcenter.remove(function (err) {
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