const express = require('express');
const ObjectId = require('mongoose').Types.ObjectId;
const ticketsRouter = express.Router();
const Session = require('../../models/Session');
const Ticket = require('../../models/Ticket');

ticketsRouter.post('/', (req, res) => {
  const { numberOfSeats, sessionId } = req.body.ticket;
  const userId = req.user._conditions._id;

  !ObjectId.isValid(sessionId)
    ? res.status(400).json({ message: 'Невалидный ObjectId' })
    : Session.findOne({ _id: sessionId }, (err, data) => {
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
          numberOfSeats,
          userId,
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
            return res.status(500).json({ message: 'Ошибка сервера' });
          }

          Session.updateOne(
            { _id: sessionId },
            { $inc: { emptySeats: -numberOfSeats } },
            (err, data) => {
              if (err) {
                return res.status(500).json({ message: 'Ошибка сервера' });
              }
              return res.json({
                message: 'Билет сохранен'
              });
            }
          );
        });
      });
});

ticketsRouter.get('/', (req, res) => {
  Ticket.find({ userId: req.user._conditions._id }, (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    return res.json({
      tickets: data
    });
  });
});

ticketsRouter.post('/:id/cancel', async (req, res) => {
  try {
    const updateTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: 'Canceled' },
      { new: true }
    );
    if (!updateTicket) {
      return res.status(404).json({ message: 'Такого билета не существует' });
    }

    const updateSession = await Session.updateOne(
      { _id: updateTicket.sessionId },
      { $inc: { emptySeats: updateTicket.numberOfSeats } }
    );

    if (updateSession) {
      return res.json({
        message: 'Билет отменён'
      });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = ticketsRouter;
