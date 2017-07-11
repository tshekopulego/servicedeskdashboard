'use strict';

var mongoose = require('mongoose'),
	AutoIncrement = require('mongoose-sequence'),
Schema = mongoose.Schema;

var CostcenterSchema = new Schema({
	costcenterId: {type: Number, default: 0, unique: true},
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

CostcenterSchema.plugin(AutoIncrement, {inc_field: 'costcenterId'});

module.exports = mongoose.model('Costcenter', CostcenterSchema);
