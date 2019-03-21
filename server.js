const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;
const Film = require('./models/Film');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/Cinema', function(err) {
  if (err) throw err;
});

app.get('/api/films', (req, res) => {
  Film.find({}, function(err, docs) {
    if (err) return res.status(500).json({ message: "Запрос не выполнен" })

    res.json({
      result: docs
    });
  });
});

app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));
