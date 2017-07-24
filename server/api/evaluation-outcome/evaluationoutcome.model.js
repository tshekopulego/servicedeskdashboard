'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');

var EvaluationoutcomeSchema = new Schema({
	evaluationoutcomeId: { type: Number },
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
EvaluationoutcomeSchema.plugin(autoIncrement.plugin, { model: 'Evaluationoutcome', field: 'evaluationoutcomeId'});