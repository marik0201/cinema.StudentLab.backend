const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ticketSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Заполните поля'],
    validate: {
      validator: function(v) {
        return /(^[а-яА-Я]{1,15}$)/.test(v);
      },
      message: props => `${props.value} - невалидное имя`
    }
  },
  numberOfSeats: { type: Number, required: [true, 'Заполните поля'],
  validate: {
    validator: function(v) {
      return /(^[1-5]{1}$)/.test(v);
    },
    message: props => `${props.value} - невалидный номер`
  } },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Заполните поля'],
    ref: 'Session'
  }
});

module.exports = mongoose.model('Ticket', ticketSchema);
