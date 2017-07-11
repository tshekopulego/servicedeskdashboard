var mongoose = require('mongoose'),
	AutoIncriment = require('mongoose-sequence'),
	
Schema = mongoose.Schema;

var PrioritySchema = new Schema({
	priorityId: {type: Number, default: 0, unique: true},
	priorityName: String,
	priorityDescription: String,
  	prioritySLA: Number,
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

PrioritySchema.plugin(AutoIncriment, {inc_field: 'priorityId'});

module.exports = mongoose.model('Priority', PrioritySchema);
