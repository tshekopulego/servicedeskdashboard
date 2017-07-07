var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PrioritySchema = new Schema({
    id: {type: Schema.Types.ObjectId, ref: 'Counter'},
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
