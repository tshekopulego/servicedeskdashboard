'use strict';

// Production specific configuration
// =================================
module.exports = {
	// Server IP
  ip:       '127.0.0.1',

	// Server port
	port:     8080,

	// MongoDB connection options
	mongo: {
		uri: 	'mongodb://admin:admin@ds151951.mlab.com:51951/servicedeskdb'
        /*uri:    'mongodb://127.0.0.1:27017/servicedesk'*/
	},
	socket:{
		handshake: {
			address: {
				address: 'http://localhost',
				port: 8080
			}
		}
	},

	assetsFolder: 'public/assets'
};
