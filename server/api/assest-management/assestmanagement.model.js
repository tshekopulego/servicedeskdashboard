var mongoose = require('mongoose'),
Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');

var AssestmanagementSchema = new Schema({
    assetCategory: {type: Schema.Types.ObjectId, ref: 'Category' },
    assetId: {type: Number},
	description: String,
	serialNumber: String,
	type:String,
    brand: String,
    location : String,
    departments:{ type: Schema.Types.ObjectId, ref: 'Department'},
    custodian: String,
    supplier: String,
    purchaseDate: Date,
    status: String,
    note: String,
    barcode: String,
    licenceExparingDate : Date,
    licenceVersion: String,
    licenceName: String,
    
	added: {
		type : Date,
		default: Date.now
	},
	modified: {
		type : Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Assestmanagement', AssestmanagementSchema);
AssestmanagementSchema.plugin(autoIncrement.plugin, { model: 'Assestmanagement', field: 'assetId'});
