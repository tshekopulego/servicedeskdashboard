'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');

var DivisionSchema = new Schema({
	divisionId: {type: Number},
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
DivisionSchema.plugin(autoIncrement.plugin, { model: 'Division', field: 'divisionId'});
