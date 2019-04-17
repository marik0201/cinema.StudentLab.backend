const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const Film = require('./models/Film');
const Session = require('./models/Session');
const Ticket = require('./models/Ticket');
const User = require('./models/User');
const ObjectId = require('mongoose').Types.ObjectId;
const passportJWT = require('passport-jwt');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const app = express();
const PORT = 3000;
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const authenticate = passport.authenticate('jwt', { session: false });
const jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('JWT');
jwtOptions.secretOrKey = 'secretKey';

const strategy = new JwtStrategy(jwtOptions, (jwt_payload, next) => {
  let user = User.findById(jwt_payload.id);
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
passport.use(strategy);

mongoose.connect('mongodb://localhost/Cinema', err => {
  if (err) {
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.post('/api/login', (req, res) => {
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
      const token = jwt.sign(payload, jwtOptions.secretOrKey, {
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

app.post('/api/signup', (req, res) => {
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

app.get('/api/films', (req, res) => {
  Film.find({}, (err, docs) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    res.json({
      result: docs
    });
  });
});

app.get('/api/sessions/:film', (req, res) => {
  Film.find({ slugName: req.params.film })
    .populate('sessions')
    .exec((err, data) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка сервера' });
      }
      if (data.length === 0) {
        return res.status(404).json({ message: 'Такого фильма не существует' });
      }
      res.json({
        result: data[0].sessions,
        filmName: data[0].name
      });
    });
});

app.post('/api/ticket', authenticate, (req, res) => {
  const { numberOfSeats, sessionId } = req.body.ticket;
  const userId = req.user._conditions._id;

  !ObjectId.isValid(sessionId)
    ? res.status(400).json({ message: 'Невалидный ObjectId' })
    : Session.findOne({ _id: sessionId }, (err, data) => {
        if (err) {
          return res.status(500).json({ message: 'Ошибка сервера' });
        }
        if (!data) {
          return res.status(400).json({ message: 'Сеанс не найден' });
        }
        if (data.emptySeats < numberOfSeats) {
          return res.status(400).json({ message: 'Места закончились' });
        }
        const ticket = new Ticket({
          numberOfSeats,
          userId,
          sessionId
        });

        const error = ticket.validateSync();

        if (error) {
          const errorMessages = [];
          for (const key in error.errors) {
            errorMessages.push(error.errors[key].message);
          }
          return res.status(400).json({
            errorMessages
          });
        }
        ticket.save(err => {
          if (err) {
            return res.status(500).json({ message: 'Ошибка сервера' });
          }

          Session.updateOne(
            { _id: sessionId },
            { $inc: { emptySeats: -numberOfSeats } },
            (err, data) => {
              if (err) {
                return res.status(500).json({ message: 'Ошибка сервера' });
              }
              return res.json({
                message: 'Билет сохранен'
              });
            }
          );
        });
      });
});

app.get('/api/tickets', authenticate, (req, res) => {
  Ticket.find({ userId: req.user._conditions._id }, (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    return res.json({
      tickets: data
    });
  });
});

app.post('/api/tickets/:id/cancel', authenticate, async (req, res) => {
  try {
    const updateTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: 'Canceled' },
      { new: true }
    );
    if (!updateTicket) {
      return res.status(400).json({ message: 'Такого билета не существует' });
    }

    const updateSession = await Session.updateOne(
      { _id: updateTicket.sessionId },
      { $inc: { emptySeats: updateTicket.numberOfSeats } }
    );

    if (updateSession) {
      return res.json({
        message: 'Билет отменён'
      });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.post('/api/auth/password', authenticate, (req, res) => {
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

app.put('/api/user', authenticate, (req, res) => {
  const { newName } = req.body;
  User.findByIdAndUpdate(
    req.user._conditions._id,
    { name: newName },
    (err, data) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка сервера' });
      }
      if (!data) {
        return res.status(400).json({ message: 'Неверные данные' });
      }

      return res.json({
        message: 'Имя изменено'
      });
    }
  );
});

app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));
