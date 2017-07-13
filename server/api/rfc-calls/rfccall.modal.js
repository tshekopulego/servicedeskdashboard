'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RfccallSchema = new Schema({
    callDescription: String,
    callRefNumber: String,
    changeRequestType: {type: Schema.Types.ObjectId, ref: 'Requesttype' },
    callEvaluationOutcome: {type: Schema.Types.ObjectId, ref: 'Evaluationoutcome' },
    rfcCallStatus: {type: Schema.Types.ObjectId, ref: 'IssueStatus',  default: '5923ea094632f26f5d77bf5f'},
    actionPlan: String,
	changeAuthorized: String,
	implementationOutcome: String,
	rfccallPriority: {type: Schema.Types.ObjectId, ref: 'Priority' },
	callStatus: String,
	status: {
		type: String,
		default: 1
	},
	modified: {
		type : Date,
		default: Date.now
	},
	added: {
		type : Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Rfccall', RfccallSchema);
