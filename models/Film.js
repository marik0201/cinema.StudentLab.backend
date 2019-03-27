const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const filmSchema = new Schema({
  name: String,
  slugName: String,
  url: String,
  sessions: [{ type: Schema.Types.ObjectId, ref: 'Session' }]
});

module.exports = mongoose.model('Film', filmSchema);
