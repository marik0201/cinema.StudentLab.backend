const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ticketSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Поле name не заполнено'],
    match: [/(^[а-яА-Яa-zA-Z]{1,15}$)/, 'Введите валидное имя']
  },
  telephone: {
    type: String,
    required: [true, 'Поле telephone не заполнено'],
    match: [/([+][0-9]{12}$)/, 'Введите валидный номер']
  },
  numberOfSeats: {
    type: Number,
    required: [true, 'Поле numberOfSeats не заполнено'],
    min: [1, 'Неверное количество мест'],
    max: [5, 'Неверное количество мест']
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Поле sessionId не заполнено '],
    ref: 'Session'
  }
});

module.exports = mongoose.model('Ticket', ticketSchema);
