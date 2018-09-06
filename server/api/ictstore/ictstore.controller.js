'use strict';

var _ = require('lodash');
var ICTStore = require('./ictstore.model');

// Get list of ictstore
exports.index = function (req, res) {
    ICTStore.find()
	.populate('costCenter','costcenterName')
	.populate('assetPriority','priorityName prioritySLA')
	
	.exec(function (err, ictstore){
		var itemsArray = []
		var itemIds = ictstore
		
		for (var i = 0; i < ictstore.length; i++) {
			var status =itemIds[i].costCenter.costcenterName
			itemsArray.push(status);
			if(itemIds.length === itemsArray.length){
				console.log(itemsArray)
				var counts = {}, i, value;
				for (i = 0; i < itemsArray.length; i++) {
					value = itemsArray[i];
					if (typeof counts[value] === "undefined") {
						counts[value] = 1;
					} else {
						counts[value]++;
					}
				}
				console.log(counts);
			}
		};
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, ictstore);
    });
};

// Get a single ictstore
exports.show = function (req, res) {
    ICTStore.findById({_id:req.params.id
	}).sort({added:1})
	
	.populate('costCenter','costcenterName')
	.populate('assetPriority','priorityName prioritySLA')
	.exec(function (err, ictstore){
        if (err) {
            return handleError(res, err);
        }
        if (!ictstore) {
            return res.send(404);
        }
        return res.json(ictstore);
    });
};

// Creates a new ictstore in the DB.
exports.create = function (req, res) {
    ICTStore.create(req.body, function (err, ictstore) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, ictstore);
    });
};

// Updates an existing ictstore in the DB.
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

// Deletes a ictstore from the DB.
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