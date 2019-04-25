const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const sessionSchema = new Schema({
  time: {
    type: String,
    required: [true, 'Поле time не заполнено']
  },
  cinema: {
    type: String,
    required: [true, 'Поле cinema не заполнено']
  },
  emptySeats: {
    type: String,
    required: [true, 'Поле emptySeats не заполнено']
  },
  filmId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Film'
  }
});

module.exports = mongoose.model('Session', sessionSchema);
