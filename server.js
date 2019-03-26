const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const Film = require('./models/Film');
const Session = require('./models/Session');
var ObjectId = require('mongodb').ObjectId;
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
  Film.find({ slugName: req.params.film }, function(err, docs) {
    if (err) return res.status(500).json({ message: 'Запрос не выполнен' });
    const filmName = docs[0].name;

    const id = docs[0]._id;

    Session.find({ filmId: id }, function(err, docs) {
      res.json({
        result: docs,
        filmName
      });
    });
  });
});

app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));
