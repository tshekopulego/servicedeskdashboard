'use strict';
var kue = require('kue'); 
var queue = kue.createQueue();

var _ = require('lodash');
var Issue = require('./issue.model');


//kue





// Get list of visitors
exports.index = function(req, res) {
	Issue.find().sort(
    { 
        issuePriorityId : -1.0
    })
    .populate('issueCategory','categoryName categoryId')
    .populate('issueStatus','issueStatusName issueStatusId')
    .populate('issueChannel','channelName channelId')
    .populate('issuePriority','priorityName prioritySLA priorityId')
    .populate('issueDivision','divisionName divisionId')
    .populate('issueUser','firstName')
    .exec(function (err, issues) {
		if(err) { return handleError(res, err); }
		return res.json(200, issues);
	});
};
// Get list of Incidents By User
exports.getIssueByUser = function(req, res) {
	Issue.find({
        issueUser : req.params.assignedUser
    }).sort(
    { 
        issuePriorityId : -1.0
    })
    .populate('issueCategory','categoryName categoryId')
    .populate('issueStatus','issueStatusName issueStatusId')
    .populate('issueChannel','channelName channelId')
    .populate('issuePriority','priorityName prioritySLA priorityId')
    .populate('issueDivision','divisionName divisionId')
    .populate('issueUser','firstName')
    .exec(function (err, issues) {
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
    .populate('issueUser','firstName')
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
	if(req.body._id) { delete req.body._id; }
	Issue.findById(req.params.id, function (err, issue) {

		if(req.body.comments) {
			issue.comments = req.body.comments;
		}

		if (err) { return handleError(res, err); }
		if(!issue) { return res.send(404); }
		var updated = _.merge(issue, req.body);

		updated.markModified('comments');

		updated.save(function (err) {
			if (err) { return handleError(res, err); }
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
	}).sort(
    { 
        "issuePriorityId" : -1.0
    })
	  .populate('issueCategory','categoryName categoryId')
    .populate('issueStatus','issueStatusName issueStatusId')
    .populate('issueChannel','channelName channelId')
    .populate('issuePriority','priorityName prioritySLA priorityId')
    .populate('issueDivision','divisionName divisionId')
    .populate('issueUser','firstName')
    .exec(function (err, issues) {
		if(err) { return handleError(res, err); }
		return res.json(200, issues);
	});
};


// Search Issue By Category
exports.showIssuesByCategory = function(req, res) {
	Issue.find({
		issueCategory:req.params.category
	}).sort(
    { 
        "issuePriorityId" : -1.0
    })
	.populate('issueCategory','categoryName categoryId')
    .populate('issueStatus','issueStatusName issueStatusId')
    .populate('issueChannel','channelName channelId')
    .populate('issuePriority','priorityName prioritySLA priorityId')
    .populate('issueDivision','divisionName divisionId')
    .populate('issueUser','firstName')
  .exec(function (err, issues) {
		if(err) { return handleError(res, err); }
		return res.json(200, issues);
	});
};

// Search Issues By Status
exports.showJobIssuesByStatus = function(req, res) {
	Issue.find({
		issueStatus:req.params.status
	}).sort(
    { 
        "issuePriorityId" : -1.0
    })
    .populate('issueCategory','categoryName categoryId')
    .populate('issueStatus','issueStatusName issueStatusId')
    .populate('issueChannel','channelName channelId')
    .populate('issuePriority','priorityName prioritySLA priorityId')
    .populate('issueDivision','divisionName divisionId')
    .populate('issueUser','firstName')
    .exec(function (err, issues) {
		if(err) { return handleError(res, err); }
		return res.json(200, issues);
	});
};

// Search Issues By Date
exports.showJobIssuesByDate = function(req, res) {
    var dateRange = JSON.parse(req.params.dateRange);
    var startDate = new Date(dateRange[0]),
        endDate = new Date(dateRange[1]);
	Issue.find({
        added: {
            $gte: new Date(startDate),
            $lt: new Date(endDate)
        }
	}).sort(
    { 
        "issuePriorityId" : -1.0
    })
    .populate('issueCategory','categoryName categoryId')
    .populate('issueStatus','issueStatusName issueStatusId')
    .populate('issueChannel','channelName channelId')
    .populate('issuePriority','priorityName prioritySLA priorityId')
    .populate('issueDivision','divisionName divisionId')
    .populate('issueUser','firstName')
    .exec(function (err, issues) {
		if(err) { return handleError(res, err); }
		return res.json(200, issues);
	});
};

var mapFunction1 = function() {
                       emit(this.issuePriorityId, this._id);
                   };
var reduceFunction1 = function(priorityId, values) {
                          return Array.sum(values);
                      };
/*
var mapFunc = function() {
    for(i=0; i < this.priorityId.length; i++) {
        var issueData = this.issues[i];
        emit(issueData.priorityId +" "+issueData._id, 1);
    }
};
var reduceFunc = function (issueData, values){
    count = 0;
    for(i=0; i<values.length; i++){
        count +=values[i];
    }
    return count;
};
*/

exports.issuesData = function (req, res) {
    
    Issue.mapReduce(
    mapFunction1,
    reduceFunction1,
        {
            out: "issueData"
        }
    )
}

function handleError(res, err) {
	return res.send(500, err);
}
