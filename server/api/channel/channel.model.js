var mongoose = require('mongoose'),

Schema = mongoose.Schema;

var ChannelSchema = new Schema({
	channelName: String,
	channelDescription: String,
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

module.exports = mongoose.model('Channel', ChannelSchema);
