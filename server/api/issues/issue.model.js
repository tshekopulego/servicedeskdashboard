var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var IssueSchema = new Schema({
    issueDescription: String,
    issueCategory: {type: Schema.Types.ObjectId, ref: 'Category' },
    issueStatus: {type: Schema.Types.ObjectId, ref: 'IssueStatus' },
    issuePriority: String,
    issueRefNumber: String,
    issueChannel: String,
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