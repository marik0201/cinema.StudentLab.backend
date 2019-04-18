const express = require('express');
const userRouter = express.Router();
const User = require('../../models/User');

userRouter.put('/', (req, res) => {
  const { newName } = req.body;
  User.findByIdAndUpdate(
    req.user._conditions._id,
    { name: newName },
    (err, data) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка сервера' });
      }
      if (!data) {
        return res.status(400).json({ message: 'Неверные данные' });
      }

      return res.json({
        message: 'Имя изменено'
      });
    }
  );
});

module.exports = userRouter;
