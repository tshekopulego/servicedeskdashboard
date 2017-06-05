'use strict';

var _ = require('lodash');
var ICTStore = require('./ictstore.model');

// Get list of category
exports.index = function (req, res) {
    ICTStore.find(function (err, ictstore) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, ictstore);
    });
};

// Get a single category
exports.show = function (req, res) {
    ICTStore.findById(req.params.id, function (err, ictstore) {
        if (err) {
            return handleError(res, err);
        }
        if (!ictstore) {
            return res.send(404);
        }
        return res.json(ictstore);
    });
};

// Creates a new category in the DB.
exports.create = function (req, res) {
    ICTStore.create(req.body, function (err, ictstore) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, ictstore);
    });
};

// Updates an existing category in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    ICTStore.findById(req.params.id, function (err, ictstore) {
        if (err) {
            return handleError(res, err);
        }
        if (!ictstore) {
            return res.send(404);
        }
        var updated = _.merge(ictstore, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, ictstore);
        });
    });
};

// Deletes a category from the DB.
exports.destroy = function (req, res) {
    ICTStore.findById(req.params.id, function (err, ictstore) {

        if (err) {
            return handleError(res, err);
        }

        if (!ictstore) {
            return res.send(404);
        }

        ictstore.remove(function (err) {
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