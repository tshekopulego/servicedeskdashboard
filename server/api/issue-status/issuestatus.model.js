var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');

var IssueStatusSchema = new Schema({
	issuestatusId: { type: Number },
	issueStatusName: String,
	issueStatusDescription: String,
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

module.exports = mongoose.model('IssueStatus', IssueStatusSchema);
IssueStatusSchema.plugin(autoIncrement.plugin, { model: 'IssueStatus', field: 'issuestatusId'});
