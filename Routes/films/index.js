const express = require('express');
const filmsRouter = express.Router();
const Film = require('../../models/Film');

filmsRouter.get('/', (req, res) => {
  Film.find({}, (err, docs) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    res.json({
      result: docs
    });
  });
});

module.exports = filmsRouter;
