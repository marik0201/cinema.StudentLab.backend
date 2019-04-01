const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: String,
  login: String,
  password: String,
  jwt: String,
  isAdmin: { type: Boolean, default: false},
  tickets: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Ticket'
  }
});

module.exports = mongoose.model('User', userSchema);