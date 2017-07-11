var mongoose = require('mongoose'),
	AutoIncrement = require('mongoose-sequence'),
	
Schema = mongoose.Schema;

var DivisionSchema = new Schema({
	divisionId: {type: Number, default: 0, unique: true},
	divisionName: String,
	divisionAddress: String,
	divisionContact: String,
	added: {
		type : Date,
		default: Date.now
	},
	modified: {
		type : Date,
		default: Date.now
	}
});

DivisionSchema.plugin(AutoIncrement, {inc_field: 'divisionId'});
module.exports = mongoose.model('Division', DivisionSchema);
