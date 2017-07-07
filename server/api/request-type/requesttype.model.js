'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RequesttypeSchema = new Schema({
    id: {type: Schema.Types.ObjectId, ref: 'Counter'},
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