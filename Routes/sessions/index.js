const express = require('express');
const sessionsRouter = express.Router();
const Film = require('../../models/Film');

sessionsRouter.get('/:film', (req, res) => {
  Film.find({ slugName: req.params.film })
    .populate('sessions')
    .exec((err, data) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка сервера' });
      }
      if (data.length === 0) {
        return res.status(404).json({ message: 'Такого фильма не существует' });
      }
      res.json({
        result: data[0].sessions,
        filmName: data[0].name
      });
    });
});

module.exports = sessionsRouter;
