var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');

var ReportSchema = new Schema({
   
    issuePriorityId: {type: Number},
    issueDivisionId: {type: Number},
    
    
});

module.exports = mongoose.model('Issue', IssueSchema);
IssueSchema.plugin(autoIncrement.plugin, { model: 'Issue', field: 'issuesId' });
