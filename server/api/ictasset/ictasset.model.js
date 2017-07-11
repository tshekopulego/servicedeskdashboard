var mongoose = require('mongoose'),
	AutoIncrement = require('mongoose-sequence'),
Schema = mongoose.Schema;

var ICTAssetSchema = new Schema({
	ictAssetId: {type: Number, default: 0, unique: true},
	assetConfigNumber: String,
	itNumber: String,
	assetDescription:String,
	assetSerialNumber:String,
    comments: {},
	assetCategory:{type: Schema.Types.ObjectId, ref: 'Category' },
	assetType:{type: Schema.Types.ObjectId, ref: 'Assettype' },
	assetPriority: {type: Schema.Types.ObjectId, ref: 'Priority' },
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

ICTAssetSchema.plugin(AutoIncrement, {inc_field: 'ictAssetId'});

module.exports = mongoose.model('ICTAsset', ICTAssetSchema);
