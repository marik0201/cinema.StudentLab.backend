const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Поле name не заполнено'],
    validate: {
      validator: function(v) {
        return v.match(/(^[а-яА-Яa-zA-Z]{1,15}$)/);
      },
      message: props => `${props.value} - невалидное имя`
    }
  },
  login: {
    type: String,
    required: [true, 'Поле login не заполнено'],
    validate: {
      validator: function(v) {
        return v.match(/(^[а-яА-Яa-zA-Z0-9]{1,15}$)/);
      },
      message: props => `${props.value} - невалидный логин`
    }
  },
  password: {
    type: String,
    required: [true, 'Поле password не заполнено'],
    validate: {
      validator: function(v) {
        return v.match(/(^[а-яА-Яa-zA-Z0-9]{1,15}$)/);
      },
      message: props => `${props.value} - невалидный пароль`
    }
  },
  isAdmin: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
