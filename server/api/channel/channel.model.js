var mongoose = require('mongoose'),

	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');

var ChannelSchema = new Schema({
	channelId: {type: Number},
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
ChannelSchema.plugin(autoIncrement.plugin, { model: 'Assettype', field: 'channelId' });
