'use strict';

var service = require('./../mail.service.js');
var dateFormat = require('dateformat');

var sendMail = function(client, invoice, invoiceFile, callback){

	var from = invoice.startDate.toString();
	var to = invoice.endDate.toString();

	var locals = {
		from: dateFormat(from,'longDate'),
		to: dateFormat(to,'longDate'),
		COMPANY: 'Service Desk',
		INVOICE : invoiceFile
	};

	service.sendinvoice('client_invoice', client, 'Service Desk Report ' + locals.from + ' - ' + locals.to, locals, callback);

};


exports.sendMail = sendMail;
