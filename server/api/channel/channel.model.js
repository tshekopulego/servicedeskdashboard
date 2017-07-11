var mongoose = require('mongoose'),
	AutoIncrement = require('mongoose-sequence'),

Schema = mongoose.Schema;

var ChannelSchema = new Schema({
	channelId: {type: Number, default: 0, unique: true},
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

ChannelSchema.plugin(AutoIncrement, {inc_field: 'channelId'});
module.exports = mongoose.model('Channel', ChannelSchema);

