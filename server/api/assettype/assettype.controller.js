'use strict';

var _ = require('lodash');
var Assettype = require('./assettype.model');

// Get list of assettype
exports.index = function (req, res) {
    Assettype.find(function (err, assettypes) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, assettypes);
    });
};

// Get a single assettype
exports.show = function (req, res) {
    Assettype.findById(req.params.id, function (err, assettypes) {
        if (err) {
            return handleError(res, err);
        }
        if (!assettype) {
            return res.send(404);
        }
        return res.json(assettypes);
    });
};

// Creates a new assettype in the DB.
exports.create = function (req, res) {
    Assettype.create(req.body, function (err, assettypes) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, assettypes);
    });
};

// Updates an existing assettype in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Assettype.findById(req.params.id, function (err, assettype) {
        if (err) {
            return handleError(res, err);
        }
        if (!assettype) {
            return res.send(404);
        }
        var updated = _.merge(assettype, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, assettype);
        });
    });
};

// Deletes a assettype from the DB.
exports.destroy = function (req, res) {
    Assettype.findById(req.params.id, function (err, assettype) {

        if (err) {
            return handleError(res, err);
        }

        if (!assettype) {
            return res.send(404);
        }

        assettype.remove(function (err) {
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