const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ticketSchema = new Schema({
  numberOfSeats: {
    type: Number,
    required: [true, 'Поле numberOfSeats не заполнено'],
    min: [1, 'Неверное количество мест'],
    max: [5, 'Неверное количество мест']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Поле sessionId не заполнено '],
    ref: 'Session'
  },
  status: { type: String, default: 'Active' }
});

module.exports = mongoose.model('Ticket', ticketSchema);
