'use strict';

var service = require('./../mail.service.js');

var sendMail = function(name, email, mailConfirmationToken, callback){

    var user = {
    	name : name,
    	email : email,
    };

    var locals = {
      name:user.name,
      COMPANY: 'Service Desk',
      CONFIRMATION_URL : 'http://localhost/confirm/',
      MAIL_CONFIRMATION_TOKEN : mailConfirmationToken
    };

    service.sendmail('user_confirmation', user, 'Activation', locals, callback);

  };

exports.sendMail = sendMail;
