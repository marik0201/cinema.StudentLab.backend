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
   return res.status(500);
  }
});

app.get('/api/films', (req, res) => {
  Film.find({}, (err, docs) => {
    if (err) {
      return res.status(500);
    }

    res.json({
      result: docs
    });
  });
});

app.get('/api/sessions/:film', (req, res) => {
  Film.find({ slugName: req.params.film })
    .populate('sessions')
    .exec( (err, data) =>{
      if (err) {
        return res.status(500);
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
  const { name, numberOfSeats, sessionId } = req.body.ticket;

  !ObjectId.isValid(sessionId)
    ? res.status(400).json({ message: 'Невалидный ObjectId' })
    : Session.findOne({ _id: sessionId }, (err, data) => {
        if (err) {
          return res.status(500);
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
            return res.status(500);
          }

          Session.updateOne(
            { _id: sessionId },
            { $inc: { emptySeats: -numberOfSeats } },
            (err, data) => {
              if (err) {
                return res.status(500);
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
