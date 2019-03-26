const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const filmSchema = new Schema({
    name: String,
    slugName: String,
    url: String
});

module.exports = mongoose.model('Film', filmSchema)