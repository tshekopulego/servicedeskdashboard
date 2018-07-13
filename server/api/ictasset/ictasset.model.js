var mongoose = require('mongoose'),
Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');

var ICTAssetSchema = new Schema({
	assetConfigNumber: String,
	itNumber: String,
	assetDescription:String,
	assetSerialNumber:String,
    comments: {},
	assetCategory:{ type: Schema.Types.ObjectId, ref: 'Category' },

	assetAssignedUser:{ type: Schema.Types.ObjectId, ref: 'User' },
	assetType:{ type: Schema.Types.ObjectId, ref: 'Assettype' },
	assetPriority: { type: Schema.Types.ObjectId, ref: 'Priority' },
	assetStore: { type: Schema.Types.ObjectId, ref: 'ICTStore' },

	assetCategoryId:{ type: Number, ref: 'Category' },
	assetTypeId: { type: Number, ref: 'Assettype' },
	assetPriority: { type: Number, ref: 'Priority' },
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
ICTAssetSchema.plugin(autoIncrement.plugin, { model: 'ICTAsset', field: 'ictassetId'});
