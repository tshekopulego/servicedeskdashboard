'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var DivisionSchema = new Schema({
    id: {type: Schema.Types.ObjectId, ref: 'Counter'},
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
