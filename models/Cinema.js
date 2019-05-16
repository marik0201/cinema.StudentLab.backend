const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const cinemaSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Поле name не заполнено']
  }
});

module.exports = mongoose.model('Cinema', cinemaSchema);
