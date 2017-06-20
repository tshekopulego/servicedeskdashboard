'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var CostcenterSchema = new Schema({
	costcenterName: String,
	costcenterDescription: String,
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
	}
});

module.exports = mongoose.model('Costcenter', CostcenterSchema);
