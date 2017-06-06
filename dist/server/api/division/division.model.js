'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var DivisionSchema = new Schema({
	divisionName: String,
	divisionAddress: String,
	divisionContact: String,
	added: {
		type : Date,
		default: Date.now
	},
	modified: {
		type : Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Division', DivisionSchema);
