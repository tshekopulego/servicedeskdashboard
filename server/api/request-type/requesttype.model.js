'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');

var RequesttypeSchema = new Schema({
	requesttypeId: { type: Number },
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

module.exports = mongoose.model('Requesttype', RequesttypeSchema);
RequesttypeSchema.plugin(autoIncrement.plugin, { model: 'Requesttype', field: 'requesttypeId' });