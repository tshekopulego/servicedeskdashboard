var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');

var IssueSchema = new Schema({
    issueDescription: String,
    issueCategory: {type: Schema.Types.ObjectId, ref: 'Category' },
    issueStatus: {type: Schema.Types.ObjectId, ref: 'IssueStatus',  default: '5923ea094632f26f5d77bf5f'},
    issueUser: {type: Schema.Types.ObjectId, ref: 'User'},
    issueChannel: {type: Schema.Types.ObjectId, ref: 'Channel' },
    issuePriority: {type: Schema.Types.ObjectId, ref: 'Priority' },
    issueDivision: {type: Schema.Types.ObjectId, ref: 'Division' },
    issueAsset: {type: Schema.Types.ObjectId, ref: 'ICTAsset' },
	issueCategoryId: {type: Number, ref: 'Category' },
    issueStatusId: {type: Number, ref: 'IssueStatus',  default: '4'},
    issueChannelId: {type: Number, ref: 'Channel' },
    issuePriorityId: {type: Number, ref: 'Priority' },
    issueDivisionId: {type: Number, ref: 'Division' },
    issueRefNumber: String,
    issueContactNumber: String,
    comments: {},
    status: {
        type: String,
        default: 1
    },
    added: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Issue', IssueSchema);
IssueSchema.plugin(autoIncrement.plugin, { model: 'Issue', field: 'issuesId' });
