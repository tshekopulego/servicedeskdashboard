var mongoose = require('mongoose'),

Schema = mongoose.Schema,
autoIncrement = require('mongoose-auto-increment');


var CounterSchema = new Schema({
	id: { type: Schema.Types.ObjectId, ref: 'Counter' },
    spec: String
});

module.exports = mongoose.model('Counter', CounterSchema);
