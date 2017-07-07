var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DepartmentSchema = new Schema({
	departmentName: String,
	departmentDescription: String,
    departmentManager: {type: Schema.Types.ObjectId, ref: 'User' },
    id: {type: Schema.Types.ObjectId, ref: 'Counter'},
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
