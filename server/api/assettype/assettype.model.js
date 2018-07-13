'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');

var AssettypeSchema = new Schema({
	assetId: {type: Number},
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

module.exports = mongoose.model('Assettype', AssettypeSchema);
AssettypeSchema.plugin(autoIncrement.plugin, { model: 'Assettype', field: 'assetId' });
