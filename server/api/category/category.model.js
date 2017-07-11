'use strict';

var mongoose = require('mongoose'),
	AutoIncrement = require('mongoose-sequence'),
Schema = mongoose.Schema;

var CategorySchema = new Schema({
	categoryId: {type: Number, default: 0, unique: true},
	categoryName: String,
	categoryDescription: String,
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

CategorySchema.plugin(AutoIncrement, {inc_field: 'categoryId'});

module.exports = mongoose.model('Category', CategorySchema);
