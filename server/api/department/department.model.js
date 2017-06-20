var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DepartmentSchema = new Schema({
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

module.exports = mongoose.model('Department', DepartmentSchema);
