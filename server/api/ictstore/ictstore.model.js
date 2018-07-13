var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');

var ICTStoreSchema = new Schema({
	ictassetId: { type: Number },
	controlNumber: String,
	nameSurname: String,
	location:String,
	costCenter:{ type: Schema.Types.ObjectId, ref: 'Costcenter' },
	assetPriority: { type: Schema.Types.ObjectId, ref: 'Priority' },
	costCenterId: { type: Number, ref: 'Costcenter' },
	assetPriorityId: { type: Number, ref: 'Priority' },
	reasonForUse: String,
	owningCompany: String,
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
ICTStoreSchema.plugin(autoIncrement.plugin, { model: 'ICTStore', field: 'ictastoreId' });
