/**
 * Main application file
 */

'use strict';

// Set default node envinment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');
var autoIncrement = require('mongoose-auto-increment');

var app      = express();
var server   = require('http').Server(app);
var io       = require('socket.io')(server);


// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Initialize Auto Incriment
autoIncrement.initialize(mongoose.connection);

// Populate DB with sample data
if(config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();
var server = require('http').createServer(app);
var socketio = require('socket.io').listen(server);
require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);

// radis server
var redis = require('redis');
var redisClient = redis.createClient({host : 'localhost', port : 6379});

redisClient.on('ready',function() {
 console.log("Redis is ready");
});

redisClient.on('error',function() {
 console.log("Error in Redis");
});

// KUE

var kue = require('kue'); 
var queue = kue.createQueue();  

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

//const kue = require('kue');  
//...
//app.use('/queue', kue.app);  
//app.use('/queue', queue);


// Expose app
exports = module.exports = app;
