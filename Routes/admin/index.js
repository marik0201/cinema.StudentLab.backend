const express = require('express');
const adminRouter = express.Router();
const User = require('../../models/User');
const Film = require('../../models/Film');
const Session = require('../../models/Session');
const passport = require('../../Service/UserAuthenticate');

adminRouter.use((req, res, next) => {
  req.user.exec(function(err, data) {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
    data.isAdmin
      ? next()
      : res.status(403).json({
          message: 'Нет доступа'
        });
  });
});

adminRouter.get('/users', (req, res) => {
  User.find({}, 'name isAdmin').exec((err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
    return res.json({
      users: data
    });
  });
});

adminRouter.post('/films', (req, res) => {
  const { name, slugName, url } = req.body;

  const newFilm = new Film({
    name,
    slugName,
    url
  });
  const error = newFilm.validateSync();

  if (error) {
    const errorMessages = [];
    for (const key in error.errors) {
      errorMessages.push(error.errors[key].message);
    }
    return res.status(400).json({
      errorMessages
    });
  }

  newFilm.save(err => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
    res.json({
      message: 'Фильм сохранен'
    });
  });
});

adminRouter.get('/films', (req, res) => {
  Film.find({}, 'name url').exec((err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
    return res.json({
      films: data
    });
  });
});

adminRouter.get('/sessions', (req, res) => {
  Session.find({})
    .populate({ path: 'filmId', select: 'name' })
    .exec((err, data) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка сервера' });
      }
      return res.json({
        sessions: data
      });
    });
});

adminRouter.post('/sessions', (req, res) => {
  const { time, cinema, emptySeats, filmId } = req.body;

  const newSession = new Session({
    time,
    cinema,
    emptySeats,
    filmId
  });
  const error = newSession.validateSync();

  if (error) {
    const errorMessages = [];
    for (const key in error.errors) {
      errorMessages.push(error.errors[key].message);
    }
    return res.status(400).json({
      errorMessages
    });
  }

  newSession.save((err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
    Film.findByIdAndUpdate(
      filmId,
      { $push: { sessions: data._id } },
      (err, data) => {
        if (err) {
          return res.status(500).json({ message: 'Ошибка сервера' });
        }
        res.json({
          message: 'Сессия сохранена'
        });
      }
    );
  });
});

adminRouter.put('/films/:id', (req, res) => {
  const { name, url } = req.body;
  Film.findByIdAndUpdate(
    req.params.id,
    { name, url },
    { new: true },
    (err, data) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка сервера' });
      }
      res.json({
        message: 'Обновлен успешно'
      });
    }
  );
});

adminRouter.put('/sessions/:id', (req, res) => {
  const { time, cinema } = req.body;
  Session.findByIdAndUpdate(
    req.params.id,
    { time, cinema },
    { new: true },
    (err, data) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка сервера' });
      }
      res.json({
        message: 'Обновлен успешно'
      });
    }
  );
});

module.exports = adminRouter;
