const express = require('express');
const cinemasRouter = express.Router();
const Cinema = require('../../models/Cinema');

cinemasRouter.get('/', async (req,res) => {
    try {
        const cinemas = await Cinema.find({})
        res.json({
            cinemas
        })   
    } catch (e) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
})

module.exports = cinemasRouter;