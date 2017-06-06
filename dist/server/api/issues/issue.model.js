var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var IssueSchema = new Schema({
    issueDescription: String,
    issueCategory: {type: Schema.Types.ObjectId, ref: 'Category' },
    issueStatus: {type: Schema.Types.ObjectId, ref: 'IssueStatus',  default: '5923ea094632f26f5d77bf5f'},
    issueChannel: {type: Schema.Types.ObjectId, ref: 'Channel' },
    issuePriority: {type: Schema.Types.ObjectId, ref: 'Priority' },
    issueDivision: {type: Schema.Types.ObjectId, ref: 'Division' },
    issueRefNumber: String,
    issueContactNumber: String,
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
