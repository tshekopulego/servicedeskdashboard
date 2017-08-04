'use strict';
var kue = require('kue'); 
var queue = kue.createQueue();

var _ = require('lodash');


var Mailgun = require('mailgun');
//init express
var express = require('express');
//init express
var app = express();


//Your api key, from Mailgun’s Control Panel
var api_key = 'pubkey-8766f6a749f3ee3312ade9414e748314';

//Your domain, from the Mailgun Control Panel
var domain = 'sandbox88e350066e2b4a6b923d7edd13e7ea6b.mailgun.org';

//Your sending email address
var from_who = 'mohapi.mokoena@skhomotech.co.za';

//Do something when you're landing on the first page

// Get list of visitors
exports.index = function(req, res) {
	
};

exports.create = function(req, res) {
	// Send a message to the specified email address when you navigate to /submit/someaddr@email.com
// The index redirects here
       console.log("Inside function")
app.get('/:mail', function(req,res) {
console.log("Inside function")
    //We pass the api_key and domain to the wrapper, or it won't be able to identify + send emails
    var mailgun = new Mailgun({apiKey: api_key, domain: domain});

    var data = {
    //Specify email data
      from: 'mohapi.mokoena@skhomotech.co.za',
    //The email to contact
      to: 'cassino.happies@gmail.com',
    //Subject and text data  
      subject: 'Hello from Mailgun'
    }

   //Invokes the method to send emails given the above data with the helper library
    mailgun.messages().send(data, function (err, body) {
        //If there is an error, render the error page
        if (err) {
            res.render('error', { error : err});
            console.log("got an error: ", err);
        }
        //Else we can greet    and leave
        else {
            //Here "submitted.jade" is the view file for this landing page 
            //We pass the variable "email" from the url parameter in an object rendered by Jade
            console.log("Testing Mohapi")
            res.render('submitted', { email : req.params.mail });
            console.log(body);
        }
    });

});
};


