'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
	if(!process.env[name]) {
		throw new Error('You must set the ' + name + ' environment variable');
	}
	return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
	env: process.env.NODE_ENV,

	// Root path of server
	root: path.normalize(__dirname + '/../../..'),

	// Server port
	port: process.env.PORT || 9000,

	// Should we populate the DB with sample data?
	seedDB: false,

	// Secret for session, you will want to change this and make it an environment variable
	secrets: {
		session: 'service-desk-secret',
		mailConfirmation : process.env.MAIL_CONFIRMATION_SECRET || 'mailConfirmation',
		passwordReset: process.env.PASSWORD_RESET_SECRET || 'passwordReset'
	},

	// List of user roles
	userRoles: ['guest', 'user', 'admin'],

	// MongoDB connection options
	mongo: {
		options: {
			db: {
				safe: true
			}
		}
	},

	mail: { //transport: process.env.MAIL_TRANSPORT_METHOD || 'mail_transport',
	host: process.env.MAIL_HOST || 'mail_host',
	port: process.env.MAIL_PORT || '465',
	secure: true,
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASS
	},
	from : {
		name : process.env.MAIL_FROM_NAME,
		address : process.env.MAIL_FROM_ADDRESS
	}
}

};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
	all,
	require('./' + process.env.NODE_ENV + '.js') || {});
