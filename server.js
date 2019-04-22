const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('./Service/UserAuthenticate');
const app = express();
const PORT = 3000;
const routes = require('./Routes');
mongoose.connect('mongodb://localhost/Cinema', err => {
  if (err) {
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(routes);

app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));
