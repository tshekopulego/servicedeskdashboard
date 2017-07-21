'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment'),
 	connection = mongoose.createConnection("mongodb://admin:admin@ds151951.mlab.com:51951/servicedeskdb");
 
autoIncrement.initialize(connection);

var RoleSchema = new Schema({
	roleId: { type: Number },
    roleName: String,
    roleDescription: String,
    userLastName: {type: Schema.Types.ObjectId, ref: 'User' },
    departmentName: {type: Schema.Types.ObjectId, ref: 'Department' },
    status: String,
	modified: {
		type : Date,
		default: Date.now
	},
	added: {
		type : Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Role', RoleSchema);
RoleSchema.pluin(autoIncrement.plugin, { model: 'Role', field: 'roleId' });
