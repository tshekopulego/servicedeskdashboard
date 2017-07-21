var mongoose = require('mongoose'),

Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment'),
 	connection = mongoose.createConnection("mongodb://admin:admin@ds151951.mlab.com:51951/servicedeskdb");
 
autoIncrement.initialize(connection);

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
