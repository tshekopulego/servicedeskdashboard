var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment'),
 	connection = mongoose.createConnection("mongodb://admin:admin@ds151951.mlab.com:51951/servicedeskdb");
 
autoIncrement.initialize(connection);

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
DepartmentSchema.plugin(autoIncrement.plugin, { model: 'Department', field: 'departmentId'});
