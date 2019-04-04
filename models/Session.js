const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const sessionSchema = new Schema({
  time: String,
  cinema: String,
  emptySeats: Number,
  filmId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Film'
  },
  tickets: [{ type: Schema.Types.ObjectId, ref: 'Ticket' }]
});

module.exports = mongoose.model('Session', sessionSchema);
