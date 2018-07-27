var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');

var IssueReportSchema = new Schema({
    issueDescription: String,
    issueCategory: {type: Schema.Types.ObjectId, ref: 'Category' },
    issueStatus: {type: Schema.Types.ObjectId, ref: 'IssueStatus',  default: '5923ea094632f26f5d77bf5f'},
    issueUser: {type: Schema.Types.ObjectId, ref: 'User',  default: '5923ea094632f26f5d77bf5f'},
    issueChannel: {type: Schema.Types.ObjectId, ref: 'Channel' },
    issuePriority: {type: Schema.Types.ObjectId, ref: 'Priority' },
    issueDivision: {type: Schema.Types.ObjectId, ref: 'Division' },
	issueCategoryId: {type: Number, ref: 'Category' },
    issueStatusId: {type: Number, ref: 'IssueStatus',  default: '4'},
    issueChannelId: {type: Number, ref: 'Channel' },
    issuePriorityId: {type: Number, ref: 'Priority' },
    issueDivisionId: {type: Number, ref: 'Division' },
    issueLoggedby: String,
    issueRefNumber: String,
    reportedBy: String,
    issueContactNumber: String,
    comments: {},
    status: {
        type: String,
        default: 1
    },
    added: {
        type: Date
    },
    closedat: {
        type: Date
    },
    modified: {
        type: Date,
        default: Date.now
    }
    
    
    
    
    
});

module.exports = mongoose.model('IssueReport', IssueReportSchema);
IssueReportSchema.plugin(autoIncrement.plugin, { model: 'IssueReport', field: 'issuesReportId' });
