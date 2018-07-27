'use strict';

var _ = require('lodash');
var Assest = require('./assestmanagement.model');




// Get list of visitors
exports.index = function(req, res) {
	Assest.find()
    .populate('assetCategory','categoryName')
    .populate('departments','departmentName')
		
    .exec(function (err, assestmanagements) {
		if(err) { return handleError(res, err); }
		return res.json(200, assestmanagements);
	});
};










// Get list of assettype
//exports.index = function (req, res) {
//    Assest.find(function (err, assests) {
//        if (err) {
//            return handleError(res, err);
//        }
//        return res.json(200, assests);
//    });
//};

// Get a single assettype
exports.show = function (req, res) {
    Assest.findById(req.params.id, function (err, assests) {
        if (err) {
            return handleError(res, err);
        }
        if (!assests) {
            return res.send(404);
        }
        return res.json(assests);
    });
};

// Creates a new assettype in the DB.
exports.create = function (req, res) {
    Assest.create(req.body, function (err, assests) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, assests);
    });
};

// Updates an existing assettype in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Assest.findById(req.params.id, function (err, assests) {
        if (err) {
            return handleError(res, err);
        }
        if (!assests) {
            return res.send(404);
        }
        var updated = _.merge(assests, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, assests);
        });
    });
};

// Deletes a assettype from the DB.
exports.destroy = function (req, res) {
    Assest.findById(req.params.id, function (err, assests) {

        if (err) {
            return handleError(res, err);
        }

        if (!assests) {
            return res.send(404);
        }

        assests.remove(function (err) {
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