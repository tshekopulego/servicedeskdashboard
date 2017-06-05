'use strict';

var _ = require('lodash');
var Admin = require('./admin.model');

exports.restoreDB = function(req, res) {
	var child = require('child_process').execFile('/home/ubuntu/restore-latest-backup.sh',
		[], function(err, stdout, stderr) {
	    // Node.js will invoke this callback when the script is done running
	    console.log(stdout);
	    return res.send(200, stdout);
	});
};

function handleError(res, err) {
	return res.send(500, err);
}

