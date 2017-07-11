var mongoose = require('mongoose'),
	AutoIncrement = require('mongoose-sequence'),
	
Schema = mongoose.Schema;

var DepartmentSchema = new Schema({
	departmentId: {type: Number, default: 0, unique: true},
	departmentName: String,
	departmentDescription: String,
    departmentManager: {type: Schema.Types.ObjectId, ref: 'User' },
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

DepartmentSchema.plugin(AutoIncrement, {inc_field: 'departmentId'});

module.exports = mongoose.model('Department', DepartmentSchema);
