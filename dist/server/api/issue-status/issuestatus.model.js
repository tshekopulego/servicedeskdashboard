var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var IssueStatusSchema = new Schema({
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
