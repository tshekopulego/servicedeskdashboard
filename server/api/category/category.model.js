'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment'),
    connection = mongoose.createConnection("mongodb://admin:admin@ds151951.mlab.com:51951/servicedeskdb");

autoIncrement.initialize(connection);

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
