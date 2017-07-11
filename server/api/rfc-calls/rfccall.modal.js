'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RfccallSchema = new Schema({
    callDescription: String,
    callRefNumber: String,
	
    changeRequestType: {type: Schema.Types.ObjectId, ref: 'Requesttype' },
    callEvaluationOutcome: {type: Schema.Types.ObjectId, ref: 'Evaluationoutcome' },
	rfccallPriority: {type: Schema.Types.ObjectId, ref: 'Priority' },
	
	changerequesttypeId: {type: Number, ref: 'Requesttype'},
	callEvaluationOutcomeId: {type: Number, ref: 'Evaluationoutcome'},
	rfccallPriorityId: {type: Number, ref: 'Priority' },
	
    actionPlan: String,
	changeAuthorized: String,
	implementationOutcome: String,
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
