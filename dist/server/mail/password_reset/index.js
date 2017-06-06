'use strict';

var service = require('./../mail.service.js');

var sendMail = function(user, passwordResetToken, callback){

    var locals = {
      name: user.name,
      COMPANY: 'Service Desk',
      PWDRESET_URL : 'http://localhost:5000/pwdreset/',
      PWDRESETTOKEN : passwordResetToken
    };

    service.sendmail('password_reset', user, 'Password reset', locals, callback);

  };


exports.sendMail = sendMail;
