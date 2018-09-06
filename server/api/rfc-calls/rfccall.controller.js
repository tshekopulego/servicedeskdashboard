'use strict';

var _ = require('lodash');
var Rfccall = require('./rfccall.modal');

// Get list of RFC Calls
exports.rfccallReport = function(req, res) {
	Rfccall.find()
    .populate('changeRequestType','requesttypeName')
    .populate('callEvaluationOutcome','evaluationoutcomeName')
	.populate('rfccallPriority','priorityName prioritySLA')
    .exec(function (err, rfccalls) {
        var items = rfccalls;
		if(err) { return handleError(res, err); }
        else {
            var temp = items.reduce(function(p,c){
                var defaultValue = {
                    x: c.changeRequestType.requesttypeName,
                    y: 0
                };
                p[c.changeRequestType.requesttypeName] = p[c.changeRequestType.requesttypeName] || defaultValue
                p[c.changeRequestType.requesttypeName].y++;
                
                return p;
            }, {});
            
            var result = [];
            for( var k in temp ){
                result.push(temp[k]);
            }
            console.log(result)
            return res.json(200, result);
        }
                                   
    })
}
// Get list of RFC Calls
exports.index = function(req, res) {
	Rfccall.find()
    .populate('changeRequestType','requesttypeName')
    .populate('callEvaluationOutcome','evaluationoutcomeName')
	.populate('rfccallPriority','priorityName prioritySLA')
    .exec(function (err, rfccalls) {

        var count = Object.keys(rfccalls).length;
		var itemsArray = []
		var itemIds = rfccalls
		for (var i = 0; i < rfccalls.length; i++) {
			var status = itemIds[i].changeRequestType.requesttypeName
			
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
		
	if(err) { return handleError(res, err); }
	return res.json(200, rfccalls);
	});
};


// Get a single RFC call
exports.show = function(req, res) {
	Rfccall.findById({
		_id:req.params.id
	}).sort({added:1})
	.populate('changeRequestType','requesttypeName')
	.populate('callEvaluationOutcome','evaluationoutcomeName')
	.populate('rfccallPriority','priorityName prioritySLA')
	
	.exec(function (err, rfccalls) {
	if(err) { return handleError(res, err); }
	return res.json(200, rfccalls)
});
};


// Get a single RFC Call
//exports.show = function(req, res) {
//	Rfccall.findById(req.params.id, function (err, rfccall) {
//		if(err) { 
//            return handleError(res, err); 
//        }
//		if(!rfccall) { return res.send(404); }
//		return res.json(rfccall);
//	});
//};

// Creates a new RFC Call in the DB.
exports.create = function(req, res) {
	Rfccall.create(req.body, function(err, rfccall) {
		if(err) { return handleError(res, err); }
		return res.json(201, rfccall);
	});
};

// Updates an existing RFC Call in the DB.
exports.update = function(req, res) {
	if(req.body._id) { delete req.body._id; }
	Rfccall.findById(req.params.id, function (err, rfccall) {
		if (err) { return handleError(res, err); }
		if(!rfccall) { return res.send(404); }
		var updated = _.merge(rfccall, req.body);
		updated.save(function (err) {
			if (err) { return handleError(res, err); }
			return res.json(200, rfccall);
		});
	});
};

// Deletes a RFC Call from the DB.
exports.destroy = function(req, res, config) {
	Rfccall.findById(req.params.id, function (err, rfccall) {
		if(err) { return handleError(res, err); }
		if(!rfccall) { return res.send(404); }
		if(config.env != 'demo') {
			rfccall.remove(function(err) {
				if(err) { return handleError(res, err); }
				return res.send(204);
			});
		} else {
			res.send(200);
		}
	});
};



// Search IRFC
exports.searchRfccall = function(req, res) {
	Rfccall.find({
		changeRequestType:req.params.changerequesttype,
		callEvaluationOutcome:req.params.callevaluationoutcome
	}).sort({added:1})
	  .populate('changeRequestType','requesttypeName')
	  .populate('callEvaluationOutcome','evaluationoutcomeName')
	 
    .exec(function (err, irfccall) {
		if(err) { return handleError(res, err); }
		return res.json(200, rfccall);
	});
};


// Search Issue By change Request Type
exports.showRfccallBychangeRequestType = function(req, res) {
	Rfccall.find({
		changeRequestType:req.params.changerequesttype
	}).sort({added:1})
	.populate('changeRequestType','requesttypeName')
	.populate('callEvaluationOutcome','evaluationoutcomeName')
	
  .exec(function (err, rfccall) {
		if(err) { return handleError(res, err); }
		return res.json(200, rfccall);
	});
};


// Search Issues By all Evaluation Outcome
exports.showRfccallBycallEvaluationOutcome = function(req, res) {
	Rfccall.find({
		callEvaluationOutcome:req.params.callevaluationoutcome
	}).sort({added:1})
	.populate('changeRequestType','requesttypeName')
	.populate('callEvaluationOutcome','evaluationoutcomeName')
    
    .exec(function (err, rfccall) {
		if(err) { return handleError(res, err); }
		return res.json(200, rfccall);
	});
};




function handleError(res, err) {
	return res.send(500, err);
}
