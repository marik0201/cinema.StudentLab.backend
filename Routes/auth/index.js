const express = require('express');
const authRouter = express.Router();
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const passport = require('../../Controllers/passport');
const jwt = require('jsonwebtoken');

authRouter.post('/login', (req, res) => {
  const { login, password } = req.body;

  if (!login && !password) {
    return res.status(400).json({
      message: 'Поля не заполнены'
    });
  }

  User.findOne({ login }, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
    if (user) {
      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          message: 'Не удалось найти пользователя'
        });
      }
      const payload = { id: user.id };
      const token = jwt.sign(payload, passport.jwtOptions.secretOrKey, {
        expiresIn: '30m'
      });
      return res.json({
        userName: user.name,
        isAdmin: user.isAdmin,
        token
      });
    }
    return res.status(400).json({
      message: 'Не удалось найти пользователя'
    });
  });
});

authRouter.post('/signup', (req, res) => {
  const { name, login, password } = req.body;

  const newUser = new User({
    name,
    login,
    password
  });

  const error = newUser.validateSync();

  if (error) {
    const errorMessages = [];
    for (const key in error.errors) {
      errorMessages.push(error.errors[key].message);
    }
    return res.status(400).json({
      errorMessages
    });
  }

  User.findOne({ login }, (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
    if (data) {
      return res.status(400).json({
        message: 'Такой пользователь уже существует. Попробуйте другой login'
      });
    }

    newUser.save(err => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка сервера' });
      }
      res.json({
        message: 'Пользователь сохранен'
      });
    });
  });
});

authRouter.post('/changepassword', passport.authenticate(), (req, res) => {
  const { oldPassword, newPassword } = req.body;
  User.findById(req.user._conditions._id, (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
    bcrypt
      .compare(oldPassword, data.password)
      .then(data => {
        if (!data) {
          return res.status(400).json({ message: 'Неверный пароль' });
        }

        User.findByIdAndUpdate(
          req.user._conditions._id,
          { password: bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10)) },
          (err, data) => {
            if (err) {
              return res.status(500).json({ message: 'Ошибка сервера' });
            }
            return res.json({
              message: 'Пароль изменён'
            });
          }
        );
      })
      .catch(err => {
        return res.status(500).json({ message: 'Ошибка сервера' });
      });
  });
});

module.exports = authRouter;
