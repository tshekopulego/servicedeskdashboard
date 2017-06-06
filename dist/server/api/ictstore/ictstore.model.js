var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var ICTStoreSchema = new Schema({
	controlNumber: String,
	nameSurname: String,
	location:String,
	costCenter:String,
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
