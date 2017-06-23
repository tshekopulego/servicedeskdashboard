'use strict';

var _ = require('lodash');
var Getcalleroversla = require('./getcalleroversla.model');

// Get list of Getcalleroversla
exports.index = function (req, res) {
    Getcalleroversla.find()
    .populate('getcalleroverslaICTAsset','ictassetName')
	.populate('getcalleroverslaICTStore','ictstoreName')
	.populate('getcalleroverslaRfccall','RfccallName')
	.populate('getcalleroverslaIssue','IssueName')
	.populate('getcalleroverslaPriority','priorityName prioritySLA')
	.exec(function (err, getcalleroverslas) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, getcalleroverslas);
    });
};

// Get a single Getcalleroversla
exports.show = function (req, res) {
    Getcalleroversla.findById({_id:req.params.id
	}).sort({added:1})
	 .populate('getcalleroverslaICTAsset','ictassetName')
	.populate('getcalleroverslaICTStore','ictstoreName')
	.populate('getcalleroverslaRfccall','rfccallName')
	.populate('getcalleroverslaIssue','issueName')
	.populate('getcalleroverslaPriority','priorityName prioritySLA')
	.exec(function (err, getcalleroverslas){
        if (err) {
            return handleError(res, err);
        }
		if (!getcalleroversla) {
            return res.send(404);
        }
        if (err) {
            return handleError(res, err); }
	return res.json(200, getcalleroverslas)
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

// Creates a new getcalleroverslas in the DB.
exports.create = function(req, res) {
	Getcalleroversla.create(req.body, function(err, getcalleroverslas) {
		if(err) { return handleError(res, err); }
		return res.json(201, getcalleroverslas);
	});
};


// Updates an existing getcalleroverslas in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id; }
    Getcalleroversla.findById(req.params.id, function (err, getcalleroversla) {
        if(req.body.comments) {
			getcalleroversla.comments = req.body.comments;
		}
        if (err) { return handleError(res, err); }
		if(!getcalleroversla) { return res.send(404); }
		var updated = _.merge(getcalleroversla, req.body);

		updated.markModified('comments');

		updated.save(function (err) {
			if (err) { return handleError(res, err); }
			return res.json(200, getcalleroversla);
		});
    });
};




// Search Getcalleroversla
exports.searchGetcalleroversla = function(req, res) {
	Getcalleroversla.find({
		getcalleroverslaICTAsset:req.params.ictasset,
		getcalleroverslaICTStore:req.params.ictstore,
		getcalleroverslaRfccall:req.params.rfccall,
		getcalleroverslaIssue:req.params.issue
		
	}).sort({added:1})
	   .populate('getcalleroverslaICTAsset','ictassetName')
	.populate('getcalleroverslaICTStore','ictstoreName')
	.populate('getcalleroverslaRfccall','rfccallName')
	.populate('getcalleroverslaIssue','issueName')
	/*.populate('getcalleroverslaPriority','priorityName prioritySLA')*/
	/*.populate('assetPriority','priorityName prioritySLA')*/
    .exec(function (err, getcalleroversla) {
		if(err) { return handleError(res, err); }
		return res.json(200, getcalleroversla);
	});
};







// search ictasset by category
/*exports.showICTAssetByCategory = function(req, res) {
	ICTAsset.find({
		assetCategory:req.params.category
	}).sort({added:1})
	.populate('assetCategory','categoryName')
	.populate('assetType','assettypeName')
	.populate('assetPriority','priorityName prioritySLA')
	.exec(function (err, ictasset) {
		if(err) { return handleError(res, err); }
		return res.json(200, ictasset);
	});
};*/
// search ictasset by assettype
/*exports.showICTAssetByAssettype = function(req, res) {
	ICTAsset.find({
		assetType:req.params.assettype
	}).sort({added:1})
	.populate('assetCategory','categoryName')
	.populate('assetType','assettypeName')
	.exec(function (err, ictasset) {
		if(err) { return handleError(res, err); }
		return res.json(200, ictasset);
	});
};*/




// Deletes a getcalleroversla from the DB.
exports.destroy = function (req, res) {
    Getcalleroversla.findById(req.params.id, function (err, getcalleroversla) {
        if (err) { return handleError(res, err); }
		if (!getcalleroversla) { return res.send(404); }
		if(config.env != 'demo') {
        getcalleroversla.remove(function (err) {
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