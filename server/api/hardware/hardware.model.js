'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');

var HardwareSchema = new Schema({
	hardwareId: {type: Number},
	hardwareName: String,
	hardwareDescription: String,
	hardwareStatus: String,
	added: {
		type : Date,
		default: Date.now
	},
	modified: {
		type : Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Hardware', HardwareSchema);
HardwareSchema.plugin(autoIncrement.plugin, { model: 'Hardware', field: 'hardwareId'});
