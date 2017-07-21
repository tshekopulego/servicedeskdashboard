'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment'),
 	connection = mongoose.createConnection("mongodb://admin:admin@ds151951.mlab.com:51951/servicedeskdb");
 
autoIncrement.initialize(connection);

var DivisionSchema = new Schema({
	divisionId: {type: Number},
	divisionName: String,
	divisionAddress: String,
	divisionContact: String,
	added: {
		type : Date,
		default: Date.now
	},
	modified: {
		type : Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Division', DivisionSchema);
DivisionSchema.plugin(autoIncrement.plugin, { model: 'Division', field: 'divisionId'});
