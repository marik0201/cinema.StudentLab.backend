const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: { type: String, required: [true, 'Введите имя'] },
  login: { type: String, required: [true, 'Введите логин'] },
  password: { type: String, required: [true, 'Введите пароль'] },
  isAdmin: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
