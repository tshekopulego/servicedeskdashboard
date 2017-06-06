var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var ICTAssetSchema = new Schema({
	assetConfigNumber: String,
	itNumber: String,
	assetDescription:String,
	assetSerialNumber:String,
	assetCategory:String,
	assetType:String,
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

module.exports = mongoose.model('ICTAsset', ICTAssetSchema);
