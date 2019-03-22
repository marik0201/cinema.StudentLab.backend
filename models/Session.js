const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const sessionSchema = new Schema({
  time: String,
  cinema: String,
  filmId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

module.exports = mongoose.model('Session', sessionSchema);
