'use strict';

var _ = require('lodash');
var Requesttype = require('./requesttype.model');

// Get list of requesttype
exports.index = function (req, res) {
    Requesttype.find()
    .exec(function (err, requesttypes) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, requesttypes);
    });
};

// Get a single requesttype
exports.show = function (req, res) {
    Requesttype.findById(req.params.id, function (err, requesttype) {
        if (err) {
            return handleError(res, err);
        }
        if (!requesttype) {
            return res.send(404);
        }
        return res.json(requesttype);
    });
};

// Creates a new requesttype in the DB.
exports.create = function (req, res) {
    Requesttype.create(req.body, function (err, requesttype) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, requesttype);
    });
};

// Updates an existing requesttype in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Requesttype.findById(req.params.id, function (err, requesttype) {
        if (err) {
            return handleError(res, err);
        }
        if (!requesttype) {
            return res.send(404);
        }
        var updated = _.merge(requesttype, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, requesttype);
        });
    });
};

// Deletes a requesttype from the DB.
exports.destroy = function (req, res) {
    Requesttype.findById(req.params.id, function (err, requesttype) {

        if (err) {
            return handleError(res, err);
        }

        if (!requesttype) {
            return res.send(404);
        }

        requesttype.remove(function (err) {
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