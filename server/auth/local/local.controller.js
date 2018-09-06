'use strict';

// ********************* Mail ***********************
var passport = require('passport');
var jwt = require('jsonwebtoken');
var mail = require('../../mail');
var config = require('../../config/environment');
var User = require('mongoose').model('User');
var auth = require('../auth.service');
// ********************* Mail ***********************


exports.root = function(req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    var error = err || info;
    if (error) return res.json(401, error);
    if (!user) return res.json(404, {message: 'Something went wrong, please try again.'});

    var token = auth.signToken(user._id, user.role);
    res.json({token: token});

  })(req, res, next)
};


/**
 * Send confirmation mail
 */
 exports.sendMailAdressConfirmationMail = function(req, res, next) {
  
  var user = req.user;
  if (user.role !== 'guest') return res.send(403);

  var mailConfirmationToken = jwt.sign({name : user.name, email: user.email,  password: user.password }, config.secrets.mailConfirmation, {expiresInMinutes: 60 * 24 * 30});
     
     console.log(mailConfirmationToken);

  mail.userConfirmation.sendMail(user.name, user.email, mailConfirmationToken, function(){
    res.send(200);
  });
};

  /**
 * Send password resset mail
 */
 exports.resetPassword = function(req, res, next) {
  var email = String(req.query.email);
  var newPassword = String(req.query.newPassword);
  console.log('Reset mail: '+email);
  console.log('newPassword: '+newPassword);

  User.findOne({email: email}, function(error, user) {  
    if (error) return next(error);
    if (!user) return res.send(403, { message: 'This email address is unknown' });
    
    var passwordResetToken = jwt.sign({userId: user._id, newPassword : newPassword}, config.secrets.passwordReset, {expiresInMinutes: 60 * 24})
    mail.passwordReset.sendMail(user, passwordResetToken, function(){res.send(200);});
  });
};

/**
 * Reset and change password
 */
 exports.confirmResetedPassword = function(req, res, next) {

  var passwordResetToken = String(req.body.passwordResetToken);

  jwt.verify(passwordResetToken, config.secrets.passwordReset, function(error, data) {

    if (error) return res.send(403);

    User.findById(data.userId,  function (error, user) {
      if (error) return res.send(403);

      user.password = data.newPassword;
      user.save(function(error) {
       if (error) return res.send(403);
       res.json({ token: auth.signToken(user._id) });
     });
    });
    
  });
};

