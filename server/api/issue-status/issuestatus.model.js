var mongoose = require('mongoose'),
	AutoIncrement = require('mongoose-sequence'),
	
Schema = mongoose.Schema;

var IssueStatusSchema = new Schema({
	issueStatusId: {type: Number, default: 0, unique: true},
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

IssueStatusSchema.plugin(AutoIncrement, {inc_field: 'issueStatusId'});
module.exports = mongoose.model('IssueStatus', IssueStatusSchema);
