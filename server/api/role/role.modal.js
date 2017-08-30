'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');

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
RoleSchema.plugin(autoIncrement.plugin, { model: 'Role', field: 'roleId' });
