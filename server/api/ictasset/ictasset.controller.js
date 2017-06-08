'use strict';

var _ = require('lodash');
var ICTAsset = require('./ictasset.model');

// Get list of ictasset
exports.index = function (req, res) {
    ICTAsset.find()
    .populate('assetCategory','categoryName') 
	.exec(function (err, ictassets) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, ictassets);
    });
};

// Get a single ictasset
exports.show = function (req, res) {
    ICTAsset.findById({_id:req.params.id
	}).sort({added:1})
	.populate('assetCategory','categoryName')
	.exec(function (err, ictasset){
        if (err) {
            return handleError(res, err);
        }
        if (err) {
            return handleError(res, err); }
	return res.json(200, ictasset)
    });
};
	/*ICTAsset.findById(req.params.id, function (err, ictasset) {
		if(err) { 
            return handleError(res, err); 
        }
		if(!ictasset) { return res.send(404); }
		return res.json(ictasset);
	});
};*/

// Creates a new ictasset in the DB.
exports.create = function(req, res) {
	ICTAsset.create(req.body, function(err, ictasset) {
		if(err) { return handleError(res, err); }
		return res.json(201, ictasset);
	});
};


// Updates an existing ictasset in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id; }
    ICTAsset.findById(req.params.id, function (err, ictasset) {
        if (err) { return handleError(res, err); }
        if (!ictasset) { return res.send(404); }
        var updated = _.merge(ictasset, req.body);
        updated.save(function (err) {
            if (err) { return handleError(res, err); }
            return res.json(200, ictasset);
        });
    });
};

exports.showICTAssetByCategory = function(req, res) {
	ICTAsset.find({
		assetCategory:req.params.category
	}).sort({added:1})
	.populate('assetCategory','categoryName')
	exec(function (err, ictasset) {
		if(err) { return handleError(res, err); }
		return res.json(200, ictasset);
	});
};


// Deletes a ictasset from the DB.
exports.destroy = function (req, res) {
    ICTAsset.findById(req.params.id, function (err, ictasset) {
        if (err) { return handleError(res, err); }
		if (!ictasset) { return res.send(404); }
		if(config.env != 'demo') {
        ictasset.remove(function (err) {
            if (err) { return handleError(res, err); }
            return res.send(204);
        });} else {
			res.send(200);
		}
	});
};
function handleError(res, err) {
	return res.send(500, err);
}