var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    title: { type: String, required: true },
    text: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User'},
    timestamp: { type: Date, default: Date.now() },
});

module.exports = mongoose.model('Message', MessageSchema);
