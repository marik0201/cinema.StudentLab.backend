const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;
const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Поле name не заполнено'],
    match: [/(^[а-яА-Яa-zA-Z]{1,15}$)/, 'Введите валидное имя']
  },
  login: {
    type: String,
    required: [true, 'Поле login не заполнено'],
    match: [/(^[а-яА-Яa-zA-Z]{1,15}$)/, 'Введите валидный логин']
  },
  password: {
    type: String,
    required: [true, 'Поле password не заполнено'],
  },
  isAdmin: { type: Boolean, default: false }
});


userSchema.pre('save', function(next) {
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT_ROUNDS, function(err, salt) {
      if (err) return next(err);    
      // hash the password using our new salt
      bcrypt.hash(user.password, salt, function(err, hash) {
          if (err) return next(err);
          // override the cleartext password with the hashed one
          user.password = hash;
          next();
      });
  });
});

module.exports = mongoose.model('User', userSchema);
