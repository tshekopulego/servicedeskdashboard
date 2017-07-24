var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');

var PrioritySchema = new Schema({
	priorityId: { type: Number },
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

module.exports = mongoose.model('Priority', PrioritySchema);
PrioritySchema.plugin(autoIncrement.plugin, { model: 'Priority', field: 'priorityId'});
