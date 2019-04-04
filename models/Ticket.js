const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ticketSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Поле name не заполнено'],
    validate: {
      validator: function(v) {
        return v.match(/(^[а-яА-Я]{1,15}$)/);
      },
      message: props => `${props.value} - невалидное имя`
    }
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
