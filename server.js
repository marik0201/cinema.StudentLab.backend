const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const Film = require('./models/Film');
const Session = require('./models/Session');
var ObjectId = require('mongodb').ObjectId; 
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let session = new Session({
  time: '23-03-2019',
  cinema: 'Ракета',
  filmId: '5c93ab0ca8275f39e0e14573'
});



  // session.save(function(err, newUser) {
  //   if (err) {
  //     console.log('Something goes wrong ');
  //   } else {
  //     console.log('Saved');
  //   }
  // });


mongoose.connect('mongodb://localhost/Cinema', function(err) {
  if (err) {
    throw err;
  }
});

app.get('/api/films', (req, res) => {
  Film.find({}, function(err, docs) {
    if (err) {
      return res.status(500).json({ message: 'Запрос не выполнен' });
    }

    res.json({
      result: docs
    });
  });
});

app.get('/api/sessions/:film', (req, res) => {
  console.log(req.params.film);
  
  Session.find(ObjectId('5c93ab0ca8275f39e0e14573'), function(err, docs){
     
    if(err) return console.log(err);
     
    console.log(docs);})

    res.json({
      result: req.params
    });
 
});


app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));
