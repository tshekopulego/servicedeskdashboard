'use strict';

var mongoose = require('mongoose'),
	AutoIncriment = require('mongoose-sequence'),
	
Schema = mongoose.Schema;

var RequesttypeSchema = new Schema({
	requesttypeId: {type: Number, default: 0, unique: true},
	requesttypeName: String,
	requesttypeDescription: String,
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

RequesttypeSchema.plugin(AutoIncriment, {inc_field: 'requesttypeId'});
module.exports = mongoose.model('Requesttype', RequesttypeSchema);