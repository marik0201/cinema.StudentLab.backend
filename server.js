const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const Film = require('./models/Film');
const Session = require('./models/Session');
const Ticket = require('./models/Ticket');
const ObjectId = require('mongoose').Types.ObjectId;
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/Cinema', function(err) {
  if (err) {
    res.status(500).json({
      message: 'Нет подключения к Базе данных'
    });
  }
});

app.get('/api/films', (req, res) => {
  Film.find({}, function(err, docs) {
    if (err) {
      return res.status(500).json({ message: 'Запрос не выполнен' });
    }

    res.json({
      result: docs
    });
  });
});

app.get('/api/sessions/:film', (req, res) => {
  Film.find({ slugName: req.params.film })
    .populate('sessions')
    .exec(function(err, data) {
      if (err) {
        return res.status(500).json({ message: 'Запрос не выполнен' });
      }

      if (data.length === 0) {
        res.status(404).json({ message: 'Такого фильма не существует' });
      } else {
        res.json({
          result: data[0].sessions,
          filmName: data[0].name
        });
      }
    });
});

app.post('/api/ticket', (req, res) => {
  let name = req.body.ticket.name;
  let numberOfSeats = req.body.ticket.numberOfSeats;
  let sessionId = req.body.ticket.sessionId;

  !ObjectId.isValid(sessionId)
    ? res.status(400).json({ message: 'Невалидный ObjectId' })
    : Session.findOne({ _id: req.body.ticket.sessionId }, (err, data) => {
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
          name,
          numberOfSeats,
          sessionId
        });

        let error = ticket.validateSync();

        if (error) {
          let errorMessages = [];
          for (const key in error.errors) {
            errorMessages.push(error.errors[key].message);
          }
          return res.status(400).json({
            errorMessages
          });
        }
        ticket.save(err => {
          if (err) {
            return res.status(500).json({ message: 'Запрос не выполнен' });
          }

          Session.updateOne(
            { _id: req.body.ticket.sessionId },
            { $inc: { emptySeats: -req.body.ticket.numberOfSeats } },
            (err, data) => {
              if (err) {
                return res.status(500).json({ message: 'Запрос не выполнен' });
              }
              return res.json({
                message: 'Билет сохранен'
              });
            }
          );
        });
      });
});
app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));
