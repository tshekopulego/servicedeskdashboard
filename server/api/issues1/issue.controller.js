'use strict';
var kue = require('kue'); 
var queue = kue.createQueue();

var _ = require('lodash');
var Issue = require('./issue.model');


//kue





// Get list of visitors
exports.index = function(req, res) {
	Issue.find()
    .populate('issueCategory','categoryName')
    .populate('issueStatus','issueStatusName')
		.populate('issueChannel','channelName')
		.populate('issuePriority','priorityName prioritySLA')
	  .populate('issueDivision','divisionName')
    .exec(function (err, issues) {
		if(err) { return handleError(res, err); }
		return res.json(200, issues);
	});
};

// Get list of visitors
exports.index = function(req, res) {
    
    
	Issue.find()
	.populate('issueCategory','categoryName')
	.populate('issueStatus','issueStatusName')
	.populate('issueChannel','channelName')
	.populate('issuePriority','priorityName prioritySLA')
	.populate('issueDivision','divisionName')
    .exec(function (err, issues) {
		
		var itemsArray = []
		var itemIds = issues
		
		for (var i = 0; i < issues.length; i++) {
			var status =itemIds[i].issueStatus.issueStatusName
			itemsArray.push(status);
			if(itemIds.length === itemsArray.length){
				//console.log(itemsArray)
				var counts = {}, i, value;
				for (i = 0; i < itemsArray.length; i++) {
					value = itemsArray[i];
					if (typeof counts[value] === "undefined") {
						counts[value] = 1;
					} else {
						counts[value]++;
					}
				}
				//console.log(counts);
			}
		};
		
		if(err) { return handleError(res, err); }
		return res.json(200, issues);
	});
};

// Get a single issue
exports.show = function(req, res) {
	Issue.findById({
		_id:req.params.id
	}).sort({added:1})
	.populate('issueCategory','categoryName')
	.populate('issueStatus','issueStatusName')
	.populate('issueChannel','channelName')
	.populate('issuePriority','priorityName prioritySLA')
	.populate('issueDivision','divisionName')
	.exec(function (err, issues) {
	if(err) { return handleError(res, err); }
	return res.json(200, issues)
});
};

// Creates a new issue in the DB.
exports.create = function(req, res) {
	Issue.create(req.body, function(err, issue) {
        
        queue.create('mduze@skhomotech.co.za', {  

        title: 'Testing Issues',

        to: 'mduze@skhomotech.co.za',

        template: 'checking the issue '+ req.body.issueDescription

            

        }).priority('high').attempts(5).save();
        
        
        
		if(err) { return handleError(res, err); }
		return res.json(201, issue);
	});
};


// Updates an existing jobcard in the DB.
exports.update = function(req, res) {
	if(req.body._id) { 
        delete req.body._id; 
    }
	Issue.findById(req.params.id, function (err, issue) {

		if(req.body.comments != null) {
			issue.comments = req.body.comments;
		}

		if (err) { 
            return handleError(res, err); 
        }
		if(!issue) { 
            return res.send(404); 
        }
		var updated = _.merge(issue, req.body);

		updated.markModified('comments');

		updated.save(function (err) {
			if (err) { 
                return handleError(res, err); 
            }
			return res.json(200, issue);
		});
	});
};


// Deletes a issue from the DB.
exports.destroy = function(req, res) {
	Issue.findById(req.params.id, function (err, issue) {
		if(err) { return handleError(res, err); }
		if(!issue) { return res.send(404); }
		if(config.env != 'demo') {
			issue.remove(function(err) {
				if(err) { return handleError(res, err); }
				return res.send(204);
			});
		} else {
			res.send(200);
		}
	});
};








// Search Issue
exports.searchIssues = function(req, res) {
	Issue.find({
		issueCategory:req.params.category,
		issueStatus:req.params.status
	}).sort({added:1})
	  .populate('issueCategory','categoryName')
	  .populate('issueStatus','issueStatusName')
	  .populate('issueChannel','channelName')
	  .populate('issuePriority','priorityName prioritySLA')
	  .populate('issueDivision','divisionName')
    .exec(function (err, issues) {
		if(err) { return handleError(res, err); }
		return res.json(200, issues);
	});
};


// Search Issue By Category
exports.showIssuesByCategory = function(req, res) {
	Issue.find({
		issueCategory:req.params.category
	}).sort({added:1})
	.populate('issueCategory','categoryName')
	.populate('issueStatus','issueStatusName')
	.populate('issueChannel','channelName')
	.populate('issuePriority','priorityName prioritySLA')
  .populate('issueDivision','divisionName')
  .exec(function (err, issues) {
		if(err) { return handleError(res, err); }
		return res.json(200, issues);
	});
};

// Search Issues By Status
exports.showJobIssuesByStatus = function(req, res) {
	Issue.find({
		issueStatus:req.params.status
	}).sort({added:1})
	  .populate('issueCategory','categoryName')
	  .populate('issueStatus','issueStatusName')
	  .populate('issueChannel','channelName')
	  .populate('issuePriority','priorityName prioritySLA')
	  .populate('issueDivision','divisionName')
    .exec(function (err, issues) {
		if(err) { return handleError(res, err); }
		return res.json(200, issues);
	});
};

// Search Issues By Date
exports.showJobIssuesByDate = function(req, res) {
    var dateRange = JSON.parse(req.params.dateRange);
    var startDate = dateRange.startDate,
        endDate = dateRange.endDate;
	Issue.find({
        added: {
            $gte: startDate,
            $lt: endDate
        }
	}).sort({added:1})
	  .populate('issueCategory','categoryName')
	  .populate('issueStatus','issueStatusName')
	  .populate('issueChannel','channelName')
	  .populate('issuePriority','priorityName prioritySLA')
	  .populate('issueDivision','divisionName')
    .exec(function (err, issues) {
		if(err) { return handleError(res, err); }
		return res.json(200, issues);
	});
};

function handleError(res, err) {
	return res.send(500, err);
}
