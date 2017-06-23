var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GetcalleroverslaSchema = new Schema({
    getcalleroverslaDescription: String,
    getcalleroverslaICTAsset: {type: Schema.Types.ObjectId, ref: 'ICTAsset' },
    getcalleroverslaStatus: {type: Schema.Types.ObjectId, ref: 'GetcalleroverslaStatus',  default: '5923ea094632f26f5d77bf5f'},
    getcalleroverslaICTStore: {type: Schema.Types.ObjectId, ref: 'ICTStore' },
    getcalleroverslaPriority: {type: Schema.Types.ObjectId, ref: 'Priority' },
    getcalleroverslaRfccall: {type: Schema.Types.ObjectId, ref: 'Rfccall' },
	 getcalleroverslaIssue: {type: Schema.Types.ObjectId, ref: 'Issue' },
    
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

module.exports = mongoose.model('Getcalleroversla', GetcalleroverslaSchema);
