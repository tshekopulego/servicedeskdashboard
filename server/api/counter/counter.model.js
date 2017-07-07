var mongoose = require('mongoose'),

Schema = mongoose.Schema;

var CounterSchema = new Schema({
    _id: String,
	seq: String
});

module.exports = mongoose.model('Counter', CounterSchema);
