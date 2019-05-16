const mongoose = require('mongoose');
const Cinema = require('./Cinema')
const Schema = mongoose.Schema;
const sessionSchema = new Schema({
  time: {
    type: String,
    required: [true, 'Поле time не заполнено']
  },
  cinemaId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Cinema'
  },
  emptySeats: {
    type: Number,
    required: [true, 'Поле emptySeats не заполнено']
  },
  filmId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Film'
  }
});

// const cinema = new Cinema({name: 'Аврора'});
// cinema.save(err=> {
//   console.log(err);
  
// })

module.exports = mongoose.model('Session', sessionSchema);
