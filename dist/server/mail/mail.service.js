'use strict';

var  config = require('../config/environment');
var nodemailer = require("nodemailer");
var _ = require('lodash');


var emailTemplates;

require('email-templates')(__dirname, { open: '{{', close: '}}' }, function(err, _emailTemplates) {

	if (err) {
		console.log('Error on opening template:');
		console.log(err);
	} else {

		emailTemplates = _emailTemplates;

	}
});

var transporter = nodemailer.createTransport(config.mail);

var generateMail = function(templateName, locals, callback){

	emailTemplates(templateName, locals, function(err, html, text) {
		if (err) {
			console.log('Error on generating mail:');
			console.log(err);
		} else {
			callback(html);
		}
	});

};


exports.sendmail = function(templateName, user, subject, locals, callback) {

	var cb = callback || _.noop;

	console.log('Send ' + subject + ' Mail');

	generateMail(templateName, locals, function(html){

		var mailOptions = {
			from: config.mail.from,
			to: {
				name: user.name,
				address: user.email
			},
			subject: subject,
			html: html,
		};

		transporter.sendMail(mailOptions, function(error, info){
			if(error){
				console.log('Error on sending' + subject + ' mail:');
				console.log(error);
				console.log(config.mail);
			}else{
				console.log(subject + 'Mail sent: ');
				cb(info.response);
			}
		});
	});
};

exports.sendinvoice = function(templateName, client, subject, locals, callback) {

	var cb = callback || _.noop;

	console.log('Send ' + subject + ' Mail');

	if(client.firstName) {
		var name = client.firstName;
		locals.name = name;
	} else {
		var name = client.companyName;
		locals.name = name;
	}

	generateMail(templateName, locals, function(html){

		var mailOptions = {
			from: config.mail.from,
			to: {
				name: name,
				address: client.email
			},
			cc: 'info@servicedesk.co.za',
			subject: subject,
			html: html,
			attachments: [
			{
				filename: 'Service Desk Report.pdf',
				path: locals.INVOICE
			}],
		};

		transporter.sendMail(mailOptions, function(error, info){
			if(error){
				console.log('Error on sending' + subject + ' mail:');
				console.log(error);
				console.log(config.mail);
			}else{
				console.log(subject + 'Mail sent: ');
				cb(info.response);
			}
		});
	});
};
