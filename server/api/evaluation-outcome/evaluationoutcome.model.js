var mongoose = require('mongoose'),
	AutoIncrement = require('mongoose-sequence'),

Schema = mongoose.Schema;

var EvaluationoutcomeSchema = new Schema({
	evaluationoutcomeName: String,
	evaluationoutcomeId: { type: Number, default: 0, unique: true}, 
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

EvaluationoutcomeSchema.plugin(AutoIncrement, {inc_field: 'evaluationoutcomeId'});
module.exports = mongoose.model('Evaluationoutcome', EvaluationoutcomeSchema);