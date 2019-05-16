const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('./Service/UserAuthenticate');
const app = express();
const PORT = 3000;
const routes = require('./Routes');
const log = require('./Config/winston');
const checkRequest = require('./Service/RequestMiddleware');

mongoose.connect('mongodb://localhost/Cinema', err => {
  if (err) {
    log.error(new Error('Не удалось подключиться к MongoDB'));
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
  log.info({
    message: `Успешное подключение к MongoDB`
  });
}); 

app.use(checkRequest);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(routes);

app.listen(PORT, () => {
  log.info({
    message: `listening on http://localhost:${PORT}`
  });
});
