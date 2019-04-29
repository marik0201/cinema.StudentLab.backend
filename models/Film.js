const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const filmSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Поле name не заполнено']
  },
  slugName: {
    type: String,
    required: [true, 'Поле slugName не заполнено']
  },
  url: {
    type: String,
    required: [true, 'Поле url не заполнено']
  },
  sessions: [{ type: Schema.Types.ObjectId, ref: 'Session' }]
});

module.exports = mongoose.model('Film', filmSchema);
