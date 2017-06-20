'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RfccallStatsSchema = new Schema({
    callDescription: String,
    callRefNumber: String,
    changeRequestType: {type: Schema.Types.ObjectId, ref: 'Requesttype' },
    callEvaluationOutcome: {type: Schema.Types.ObjectId, ref: 'Evaluationoutcome' },
    priorities: {type: Schema.Types.ObjectId, ref: 'Priority'},
    actionPlan: String,
	changeAuthorized: String,
	implementationOutcome: String,
	callStatus: String,
	modified: {
		type : Date,
		default: Date.now
	},
	added: {
		type : Date,
		default: Date.now
	}
});

module.exports = mongoose.model('RfccallStats', RfccallStatsSchema);
