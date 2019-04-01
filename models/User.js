const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: String,
  login: String,
  password: String,
  isAdmin: { type: Boolean, default: false},
});

module.exports = mongoose.model('User', userSchema);