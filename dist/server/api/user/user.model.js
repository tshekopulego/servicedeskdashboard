'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['github', 'twitter', 'facebook', 'google'];

var UserSchema = new Schema({
	firstName: String,
	lastName: String,
	name: String,
	email: { type: String, lowercase: true },
	clientLocation: String,
	role: {
		type: String,
		default: 'admin'
	},
	clientType: String,
	clientPackage: {type: Schema.Types.ObjectId, ref: 'Packages' },
	billingType: String,
	companyName: String,
	contactPerson: String,
	contactPersonPhoneNumber: String,
	phoneNumber: String,
	needsWaybill: {
		type: Boolean,
		default: false
	},
	//zone:  {type: Schema.Types.ObjectId, ref: 'DeliveryZone'},
	extraContacts: {},
	status: {
		type: String,
		default: 1
	},
	added: {
		type : Date,
		default: Date.now
	},
	modified: {
		type : Date,
		default: Date.now
	},
	hashedPassword: String,
	provider: String,
	salt: String,
	facebook: {},
	twitter: {},
	google: {},
	github: {}
});

/**
* Virtuals
*/
UserSchema
.virtual('password')
.set(function(password) {
	this._password = password;
	this.salt = this.makeSalt();
	this.hashedPassword = this.encryptPassword(password);
})
.get(function() {
	return this._password;
});

// Public profile information
UserSchema
.virtual('profile')
.get(function() {
	return {
		'firstName': this.firstName,
		'lastName': this.lastName,
		'role': this.role,
		'companyName': this.companyName,
		'contactPerson': this.contactPerson,
		'contactPersonPhoneNumber': this.contactPersonPhoneNumber,
		'clientType': this.clientType,
		'billingType': this.billingType,
		'clientPackage': this.clientPackage,
		'email': this.email,
		'phoneNumber': this.phoneNumber,
		'clientLocation': this.clientLocation,
		'needsWaybill': this.needsWaybill,
		'zone': this.zone,
		'extraContacts': this.extraContacts
	};
});

// Non-sensitive info we'll be putting in the token
UserSchema
.virtual('token')
.get(function() {
	return {
		'_id': this._id,
		'role': this.role
	};
});

UserSchema
.virtual('fullname')
.get(function() {
	return {
		'fullname': this.firstName+' '+this.lastName
	};
});

/**
* Validations
*/

// Validate empty email
UserSchema
.path('email')
.validate(function(email) {
	if (authTypes.indexOf(this.provider) !== -1) return true;
	return email.length;
}, 'Email cannot be blank');

// Validate empty password
UserSchema
.path('hashedPassword')
.validate(function(hashedPassword) {
	if (authTypes.indexOf(this.provider) !== -1) return true;
	return hashedPassword.length;
}, 'Password cannot be blank');

// Validate email is not taken
UserSchema
.path('email')
.validate(function(value, respond) {
	var self = this;
	this.constructor.findOne({email: value}, function(err, user) {
		if(err) throw err;
		if(user) {
			if(self.id === user.id) return respond(true);
			return respond(false);
		}
		respond(true);
	});
}, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
	return value && value.length;
};

/**
* Pre-save hook
*/
// UserSchema
// .pre('save', function(next) {
// 	if (!this.isNew) return next();
// 	if(this.role !== 'client') {
// 		if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
// 			next(new Error('Invalid password'));
// 		else
// 			next();
// 	}
// });

/**
* Methods
*/
UserSchema.methods = {
	/**
	* Authenticate - check if the passwords are the same
	*
	* @param {String} plainText
	* @return {Boolean}
	* @api public
	*/
	authenticate: function(plainText) {
		return this.encryptPassword(plainText) === this.hashedPassword;
	},

	activated: function(email) {
		return this.status == 1;
	},

	/**
	* Make salt
	*
	* @return {String}
	* @api public
	*/
	makeSalt: function() {
		return crypto.randomBytes(16).toString('base64');
	},

	/**
	* Encrypt password
	*
	* @param {String} password
	* @return {String}
	* @api public
	*/
	encryptPassword: function(password) {
		if (!password || !this.salt) return '';
		var salt = new Buffer(this.salt, 'base64');
		return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
	}
};

module.exports = mongoose.model('User', UserSchema);
