'use strict';

var mongoose = require('mongoose'),
	AutoIncrement = require('mongoose-sequence'),
Schema = mongoose.Schema;

var AssettypeSchema = new Schema({
	assetId: {type: Number, default: 0, unique: true},
	assettypeName: String,
	assettypeDescription: String,
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

AssettypeSchema.plugin(AutoIncrement, {inc_field: 'assetId'});

module.exports = mongoose.model('Assettype', AssettypeSchema);
