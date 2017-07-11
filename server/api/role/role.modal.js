'use strict';

var mongoose = require('mongoose'),
	AutoIncriment = require('mongoose-sequence'),
Schema = mongoose.Schema;

var RoleSchema = new Schema({
	roleId: {type: Number, default: 0, unique: true},
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

RoleSchema.plugin(AutoIncriment, {inc_field: 'roleId'});
module.exports = mongoose.model('Role', RoleSchema);
