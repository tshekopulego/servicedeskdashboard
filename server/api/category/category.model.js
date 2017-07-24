'use strict';

var mongoose = require('mongoose'),
	autoIncrement = require('mongoose-auto-increment'),
Schema = mongoose.Schema;

var CategorySchema = new Schema({
	categoryId: {type: Number},
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

module.exports = mongoose.model('Category', CategorySchema);
CategorySchema.plugin(autoIncrement.plugin, { model: 'Assettype', field: 'categoryId' });
