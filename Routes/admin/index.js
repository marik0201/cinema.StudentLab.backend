const express = require('express');
const adminRouter = express.Router();
const slug = require('transliteration').slugify;
const User = require('../../models/User');
const Film = require('../../models/Film');
const Ticket = require('../../models/Ticket');
const Session = require('../../models/Session');

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

adminRouter.delete('/users/:id', (req, res) => {
  User.findByIdAndDelete(req.params.id, (err, data) => {
    if (!data) {
      return res.status(404).json({
        message: 'Пользователя не существует'
      });
    }
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    Ticket.remove({ userId: req.params.id }, (err, data) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка сервера' });
      }
      res.json({
        message: 'Пользователь удалён'
      });
    });
  });
});

adminRouter.post('/users/makeadmin/:id', (req, res) => {
  User.findByIdAndUpdate(req.params.id, { isAdmin: true }, (err, data) => {
    if (!data) {
      return res.status(404).json({
        message: 'Пользователя не существует'
      });
    }

    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
    res.json({
      message: 'Изменена роль на Администратор'
    });
  });
});

adminRouter.post('/users/changerole/:id', (req, res) => {
  User.findById(req.params.id, (err, data) => {
    if (!data) {
      return res.status(404).json({
        message: 'Пользователя не существует'
      });
    }

    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
    data.isAdmin = !data.isAdmin;

    data.save((err, data) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка сервера' });
      }
      data.isAdmin
        ? res.json({
            message: 'Статус сменён на Администратора'
          })
        : res.json({
            message: 'Статус сменён на пользователя'
          });
    });
  });
});

adminRouter.post('/users/makeuser/:id', (req, res) => {
  User.findByIdAndUpdate(req.params.id, { isAdmin: false }, (err, data) => {
    if (!data) {
      return res.status(404).json({
        message: 'Пользователя не существует'
      });
    }

    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
    res.json({
      message: 'Изменена роль на Пользователь'
    });
  });
});

adminRouter.post('/films', (req, res) => {
  const { name, url } = req.body;
  const slugName = slug(name);

  if (name && url) {
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
  } else {
    return res.status(400).json({
      message: 'Поле name и/или url не указано'
    });
  }
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

adminRouter.delete('/films/:id', (req, res) => {
  Film.findByIdAndDelete(req.params.id, (err, data) => {
    if (!data) {
      return res.status(404).json({
        message: 'Фильма не существует'
      });
    }

    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    Session.deleteMany({ filmId: req.params.id }, (err, data) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка сервера' });
      }

      Ticket.deleteMany({ sessionId: req.params.id }, (err, data) => {
        if (err) {
          return res.status(500).json({ message: 'Ошибка сервера' });
        }

        res.json({
          message: 'Фильм удалён'
        });
      });
    });
  });
});

adminRouter.get('/sessions', (req, res) => {
  Session.find({})
    .populate([{ path: 'filmId', select: 'name'}, { path: 'cinemaId', select: 'name' }])
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

adminRouter.delete('/sessions/:id', (req, res) => {
  Session.findByIdAndDelete(req.params.id, (err, data) => {
    if (!data) {
      return res.status(404).json({
        message: 'Сеанса не существует'
      });
    }

    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    Ticket.remove({ sessionId: req.params.id }, (err, data) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка сервера' });
      }

      res.json({
        message: 'Сеанс удалён'
      });
    });
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
