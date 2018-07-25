'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');

var RfccallSchema = new Schema({
    callDescription: String,
    callRefNumber: String,
    changeRequestType: {type: Schema.Types.ObjectId, ref: 'Requesttype' },
    callEvaluationOutcome: {type: Schema.Types.ObjectId, ref: 'Evaluationoutcome' },
	changeRequestTypeId: { type: Number, ref: 'Requesttype'},
	callEvaluationOutcomeId: { type: Number, ref: 'Evaluationoutcome'},
	priorityId: { type: Number, ref: 'Priority' },
	departmentId: { type: Number, ref: 'Department'},
   /* priorities: {type: Schema.Types.ObjectId, ref: 'Priority'},*/
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
RfccallSchema.plugin(autoIncrement.plugin, { model: 'Rfccall', field: 'rfccallId' });
