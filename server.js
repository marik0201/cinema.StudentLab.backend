const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const Film = require('./models/Film');
const Session = require('./models/Session');
const Ticket = require('./models/Ticket');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/Cinema', function(err) {
  if (err) {
    throw err;
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

  if (!req.body.ticket || !name || !numberOfSeats || !sessionId) {
    res.status(404).json({ message: 'Не все данные введены' });
  } else if (
    typeof name !== 'string' ||
    typeof numberOfSeats !== 'number' ||
    typeof sessionId !== 'string'
  ) {
    res.status(404).json({ message: 'Некорректные данные' });
  } else {
    Session.findOne({ _id: req.body.ticket.sessionId }, (err, data) => {
      if (err) {
        return res.status(500).json({ message: 'Запрос не выполнен' });
      }

      if (data.emptySeats < numberOfSeats) {
        res.status(404).json({ message: 'Места закончились' });
      } else {
        const ticket = new Ticket({
          name: req.body.ticket.name,
          numberOfSeats: req.body.ticket.numberOfSeats,
          sessionId: req.body.ticket.sessionId
        });

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
              res.json({
                message: 'Билет сохранен'
              });
            }
          );
        });
      }
    });
  }
});
app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));
