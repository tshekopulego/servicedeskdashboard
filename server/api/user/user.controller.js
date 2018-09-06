'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var mail = require('../../mail');

var nodemailer = require('nodemailer');
//var smtpTransport = require('nodemailer-smtp-transport');

var validationError = function(res, err) {
	return res.json(422, err);
};

/**
 * Creates a new user
 */
 exports.createGuest = function (req, res, next) {

 	var email = req.body.email;
 	var firstName = req.body.firstName;
 	var lastName = req.body.lastName;
 	var password = req.body.password;
 	var role = req.body.role;
    var department = req.body.department;

 	if(role == 'client') {
 		//console.log(req.body);
 		var newUser = new User(req.body);
	 	newUser.provider = 'locals';
	 	//newUser.role = 'user';
	 	newUser.save(function(err, user) {
	 		if (err) return validationError(res, err);
	 		var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
	 		res.json({ token: token });
	 	});
 	} else {
 		User.findOne({email: email}, function(err, user){

 			if (user) return validationError(res, {message:'The specified email address is already in use.'});

 			var guestSessionToken = jwt.sign({email: email, firstName : req.body.firstName, department : req.body.department, role : 'guest' , password: password }, config.secrets.session, { expiresInMinutes: 60*5 });
 			res.json({ token: guestSessionToken });

 			var mailConfirmationToken = jwt.sign({firstName : req.body.firstName, lastName: req.body.lastName, email: req.body.email, role: req.body.role, password: req.body.password }, config.secrets.mailConfirmation, {expiresInMinutes: 60 * 24 * 30});
			
			//sending emails confirmatiom 
			var user = {
               	name : req.body.lastName,
                email : req.body.email
			   };
			//console.log(user);
    
			var locals = {
				  email:user.email,
				  name:user.name,
				  COMPANY: 'Service Desk',
				  CONFIRMATION_URL : 'http://localhost:8080/confirm',
				  MAIL_CONFIRMATION_TOKEN : mailConfirmationToken
				};
			//console.log(locals)
			var templateName = '/user_confirmation/html';
			//mail.userConfirmation.sendMail(templateName, locals, null);
			
 			//mail.userConfirmation.sendMail(req.body.firstName, req.body.email, mailConfirmationToken, null);
			mail.userConfirmation.sendMail(user.name, user.email, mailConfirmationToken, null)

 		});
 	}
};

exports.registerClient = function(req, res, next) {
	var phoneNumber = req.body.phoneNumber;
	User.findOne({phoneNumber: phoneNumber}, function(err, user){
		if(user) {
 			console.log(user);
 			if(!user.hashedPassword) {
 				user.password = req.body.password;
 				user.save(function(err) {
	 				if (err) return validationError(res, err);
	 				var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
	 				res.json({ token: token });
	 			});
 			} else {
 				res.send(403);
 			}

 		} else {
            var newUser = new User(user);
            newUser.save(function(err, user) {
 				if (err) return validationError(res, err);
 				var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
 				res.json({ token: token });
 			});
 		}
	});
};
 /**
 * Confirm mail address
 */
 exports.createUser = function(req, res, next) {
 	var mailConfirmationToken = req.param('mailConfirmationToken');

 	jwt.verify(mailConfirmationToken, config.secrets.mailConfirmation, function(error, data) {

 		if (error) return res.send(403);

 		if (data.exp < Date.now()) return res.send(403);

 		User.findOne({email: data.email}, function(error, user){
            console.log(data)
 			if (error) return res.send(403);
 			if (user) return res.send(403);

 			var newUser = new User(data);
 			newUser.provider = 'locals';
            if (!data.role){
                newUser.role = 'admin';
            } else {
                newUser.role = data.role;
            }
 			newUser.confirmedEmail = true;

 			newUser.save(function(err, user) {
 				if (err) return validationError(res, err);
 				var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
 				res.json({ token: token });
 			});

 		});
 	});
 };

/**
 * Get list of users
 * restriction: 'admin'
 */
 exports.index = function(req, res) {
 	User.find({}, '-salt -hashedPassword')
 	.sort('firstName')
     .populate('departmentName','departmentName')
 	.exec(function (err, users) {
 		if(err) return res.send(500, err);
 		res.json(200, users);
 	});
 };

/**
 * Creates a new user
 */
 exports.create = function (req, res, next) {
 	var newUser = new User(req.body);
 	newUser.provider = 'locals';
 	newUser.role = 'user';
     
     User.create(req.body, function(err, rfccall) {
                 if(err) { return handleRrror(res,err); }
                 return res.json(201, user);
                 });
     
 	newUser.save(function(err, user) {
 		if (err) return validationError(res, err);
 		var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
 		res.json({ token: token });
 	});
 };

/**
 * Get a single user
 */
 exports.show = function (req, res, next) {
 	var userId = req.params.id;

 	User.findById(userId, function (err, user) {
 		if (err) return next(err);
 		if (!user) return res.send(404);
 		res.json(user.profile);
 	}).populate('clientPackage','packageName').populate('zone','deliveryZoneType deliveryZoneArea deliveryZoneAmount');
 };

/**
 * Get a single user all details
 */
 exports.showUser = function (req, res, next) {
 	var userId = req.params.id;
     
     
 	User.findById(userId, function (err, user) {
 		if (err) return next(err);
 		if (!user) return res.send(404);
 		res.json(user);
    }).populate('clientPackage','packageName')
        .populate('departmentName','departmentName')
        .populate('zone','deliveryZoneType deliveryZoneArea deliveryZoneAmount');
 };
 /**
  * Get all clients
  */
 exports.clients = function (req, res) {
  	User.find({role:'client'}, '-salt -hashedPassword')
  	.populate('clientPackage','packageName packageDescription packagePrice packageLimit priceBeforeLimit priceAfterLimit billingType')
  	.sort('firstName')
  	.exec(function (err, clients) {
 		if (err) return next(err);
 		if (!clients) return res.send(404);
 		res.json(200,clients);
 	});
 };


 exports.client = function (req, res) {
 	var userId = req.params.id

  	User.findOne({_id:userId, role:'client'}, '-salt -hashedPassword')
  	.populate('clientPackage','packageName packageDescription packagePrice packageLimit priceBeforeLimit priceAfterLimit billingType')
  	.populate('zone','deliveryZoneType deliveryZoneArea deliveryZoneAmount')
  	.sort('firstName')
  	.exec(function (err, client) {
 		if (err) return next(err);
 		if (!client) return res.send(404);
 		res.json(200,client);
 	});
 };

/**
 * Deletes a user
 * restriction: 'admin'
 */
 exports.destroy = function(req, res) {
	User.findById(req.params.id, function (err, user) {
		if(err) { return handleError(res, err); }
		if(!user) { return res.send(404); }
		if(config.env != 'demo') {
			user.remove(function(err) {
				if(err) { return handleError(res, err); }
				res.send(204);
			});
		} else {
			res.send(200);
		}
	});
};

/**
 * Change a users password
 */
 exports.changePassword = function(req, res, next) {
 	var userId = req.params.id;
 	var oldPass = String(req.body.oldPassword);
 	var newPass = String(req.body.newPassword);

 	User.findById(userId, function (err, user) {
 		if(user.authenticate(oldPass)) {
 			user.password = newPass;
 			if(config.env != 'demo') {
 				user.save(function(err) {
 					if (err) return validationError(res, err);
 					res.send(200);
 				});
 			} else {
 				res.send(200);
 			}
 		} else {
 			res.send(403);
 		}
 	});
 };

 exports.updateUser = function(req, res, next) {
 	req.body.modified = Date.now();
 	console.log(req.body);

	User.findByIdAndUpdate(req.params.id,req.body,function(err, user) {
		if (err) return validationError(res, err);
		res.send(200);
	});
};

/**
 * Get my info
 */
 exports.me = function(req, res, next) {
 	var userId = req.user._id;
 	User.findOne({
 		_id: userId
	}, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
	if (err) return next(err);
	if (!user) return res.json(404);
	res.json(user);
});
 };

/**
 * Authentication callback
 */
 exports.authCallback = function(req, res, next) {
 	res.redirect('/');
 };

 function handleError(res, err) {
 	return res.send(500, err);
 }
