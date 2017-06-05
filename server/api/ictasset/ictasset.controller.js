'use strict';

var _ = require('lodash');
var ICTAsset = require('./ictasset.model');

// Get list of category
exports.index = function (req, res) {
    ICTAsset.find(function (err, ictasset) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, ictasset);
    });
};

// Get a single category
exports.show = function (req, res) {
    ICTAsset.findById(req.params.id, function (err, ictasset) {
        if (err) {
            return handleError(res, err);
        }
        if (!ictasset) {
            return res.send(404);
        }
        return res.json(ictasset);
    });
};

// Creates a new category in the DB.
exports.create = function (req, res) {
    ICTAsset.create(req.body, function (err, ictasset) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, ictasset);
    });
};

// Updates an existing category in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    ICTAsset.findById(req.params.id, function (err, ictasset) {
        if (err) {
            return handleError(res, err);
        }
        if (!ictasset) {
            return res.send(404);
        }
        var updated = _.merge(ictasset, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, ictasset);
        });
    });
};

// Deletes a category from the DB.
exports.destroy = function (req, res) {
    ICTAsset.findById(req.params.id, function (err, ictasset) {

        if (err) {
            return handleError(res, err);
        }

        if (!ictasset) {
            return res.send(404);
        }

        ictasset.remove(function (err) {
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