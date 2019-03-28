const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ticketSchema = new Schema({
  name: String,
  numberOfSeats: Number,
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Session'
  }
});

module.exports = mongoose.model('Ticket', ticketSchema);