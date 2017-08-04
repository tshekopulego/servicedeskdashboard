'use strict';
var kue = require('kue'); 
var queue = kue.createQueue();
var later = require('later');
var moment = require('moment'); 
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

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
	Issue.create(req.body, function(err, issue){ 
        
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
 // Email transporter configuration
    var transporter = nodemailer.createTransport(smtpTransport({
    host: 'smtp.gmail.com', //smtp.gmail.com
    port: 465,  // secure:true for port 465, secure:false for port 587
    secure: true,
    auth: {
        user: 'mthunziduze@gmail.com',
        pass: 'mth957PAL?'
    }
}));



  // will fire every 20 minutes
  var textSched = later.parse.text('every 20 min');
  
  // execute logTime for each successive occurrence of the text schedule
 var timer2 = later.setInterval(bridgedSLAEmail, textSched);

  // send email for bridged SLA's
  function bridgedSLAEmail() {
       console.log('Inside email function');
       Issue.find().populate('issuePriority','prioritySLA')
                   .populate('issueStatus','issueStatusName')
                   .exec(function (err, issues) {
           
           var now = moment(new Date()); //todays date
           var itemIds = issues
                var i= 0;
                for ( i = 0; i < issues.length; i++) {
                          
                    var req =itemIds[i]
                    
                    var duration = moment.duration(now.diff(req.modified));
                    var hours = duration.asHours();
                    var slaHours = req.issuePriority.prioritySLA;
                    
                    
                    if(hours > slaHours && req.issueStatus.issueStatusName=='New'){
                        
                        // creating kue
                         queue.create('email',{  
                         title: req.issueRefNumber +' SLA Bridged',
                         to: 'cassino.happies@gmail.com',
                         template: 'Service Desk ' + req.issueDescription
                     }).delay(60000).priority('high').save();
                        
                        var newDate =now;
                        var newModifiedDate = newDate.format("YYYY-MM-DD HH:mm:ss");
                        
                            Issue.findById(req.id, function (err, issue) {
                                
                            req.modified = newModifiedDate;
                            var updated = _.merge(issue, req);

                             updated.save(function (err) {
                                    if (err) { return handleError(res, err); }
                                    console.log(issue)
                                });
                            });
                    }   
             }
           
           if(err) { return handleError(res, err);}
                      
       });
  }
  
// processing email using nodemailer 
   queue.process('email', 2000, function (job, done) {
        var transporter = nodemailer.createTransport(smtpTransport({
                                host: 'smtp.gmail.com', //smtp.gmail.com
                                port: 465,  // secure:true for port 465, secure:false for port 587
                                secure: true,
                                auth: {
                                        user: 'mthunziduze@gmail.com',// login Details 
                                        pass: 'mth957PAL?'
                                    }
                                }));

        
            transporter.sendMail({  //email options
                    
            from: "mthunziduze@gmail.com", // sender address.  Must be the same as authenticated user if using Gmail.
            to: "cassino.happies@gmail.com", // receiver
            subject:'SLA Bridged',// issue status
            text: "SLA bridged, please attend the call within 1 hour or the call will be escalated."
                    
                    
      // Console subject
    
        }, function(error, response){  //callback
            if(error){
                console.log(error);
                      
                }else{
                        console.log("Message sent: ");
                    }
                transporter.close(); // shut down the connection pool, no more messages.  Comment this line out to continue sending emails.
            });
         done();
});      

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

function handleError(res, err) {
	return res.send(500, err);
}
