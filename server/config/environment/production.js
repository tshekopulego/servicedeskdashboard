'use strict';

// Production specific configuration
// =================================
module.exports = {
	// Server IP
	ip:       process.env.OPENSHIFT_NODEJS_IP ||
						process.env.IP ||
						undefined,

	// Server port
	port:     process.env.OPENSHIFT_NODEJS_PORT ||
						process.env.PORT ||
						8080,

	// MongoDB connection options
	mongo: {
		uri:   'mongodb://tshekom:Tsheko1@ds123050.mlab.com:23050/uhurudb'
	},
	socket:{
		handshake: {
			address: {
				address: process.env.DOMAIN || 'http://localhost',
				port: process.env.OPENSHIFT_NODEJS_PORT ||
						process.env.PORT ||
						8080
			}
		}
	},

	assetsFolder: 'public/assets'
};
