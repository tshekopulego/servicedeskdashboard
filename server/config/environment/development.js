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
		uri:   'mongodb://admin:admin@ds151951.mlab.com:51951/servicedeskdb'
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
