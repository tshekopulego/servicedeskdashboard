'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var EvaluationoutcomeSchema = new Schema({
	evaluationoutcomeName: String,
	evaluationoutcomeDescription: String,
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

module.exports = mongoose.model('Evaluationoutcome', EvaluationoutcomeSchema);