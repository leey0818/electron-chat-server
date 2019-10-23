const mongoose = require('mongoose');

const { Schema } = mongoose;

const MessageSchema = new Schema({
  text: { type: String, required: true },
  room: { type: Schema.Types.ObjectId, ref: 'Room' },
  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  receivers: [{ type: Schema.Types.ObjectId, ref: 'User' }],

  CreatedAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model('Message', MessageSchema);
