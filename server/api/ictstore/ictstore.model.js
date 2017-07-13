var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var ICTStoreSchema = new Schema({
	controlNumber: String,
	nameSurname: String,
	location:String,
	costCenter:{type: Schema.Types.ObjectId, ref: 'Costcenter' },
	assetPriority: {type: Schema.Types.ObjectId, ref: 'Priority' },
    ictStoreStatus: {type: Schema.Types.ObjectId, ref: 'IssueStatus',  default: '5923ea094632f26f5d77bf5f'},
	reasonForUse:String,
	owningCompany:String,
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

module.exports = mongoose.model('ICTStore', ICTStoreSchema);
