const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const Film = require('./models/Film');
const Session = require('./models/Session');
const Ticket = require('./models/Ticket');
const User = require('./models/User');
const app = express();
let passportJWT = require('passport-jwt');
var jwt = require('jsonwebtoken');
var passport = require('passport');
const PORT = 3000;

let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());

let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('JWT');
jwtOptions.secretOrKey = 'secretKey';

let strategy = new JwtStrategy(jwtOptions, (jwt_payload, next) => {
  let user = User.findById(jwt_payload.id);
  // var user = users.filter( user => user.id == jwt_payload.id)[0];
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});

passport.use(strategy);

mongoose.connect('mongodb://localhost/Cinema', function(err) {
  if (err) {
    throw err;
  }
});

app.post('/api/login',  (req, res) => {
  let login = req.body.login;
  let password = req.body.password;

  User.findOne({ login }).then(user => {
    if (user && user.password === password) {
      const payload = { id: user.id };
      let token = jwt.sign(payload, jwtOptions.secretOrKey, {
        expiresIn: '12h'
      });
      return res.json({
        userName: user.name,
        userLogin: user.login,
        token
      });
    }
    return res.status(404).json({
      message: 'Не удалось найти пользователя'
    });
  });

  app.post('/api/signin', (req,res) => {
    
  })

  //   var user = users.filter( user => user.name == name)[0];
  //   if( ! user ){
  //     next(new Error("Нет такого юзера"));
  //   }
  //   console.log(user);

  //   if(user.password === req.body.password) {
  //     // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
  //     var payload = {id: user.id};
  //     console.log('nice');

  //     var token = jwt.sign(payload, jwtOptions.secretOrKey);
  //     console.log(name);

  //     res.json({message: "ok", token: token, user:name});
  //   } else {
  //     next(new Error("Неверный пароль"));
  // }
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
  Film.find({ slugName: req.params.film })
    .populate('sessions')
    .exec(function(err, data) {
      if (err) {
        return res.status(500).json({ message: 'Запрос не выполнен' });
      }

      if (data.length === 0) {
        res.status(404).json({ message: 'Такого фильма не существует' });
      } else {
        res.json({
          result: data[0].sessions,
          filmName: data[0].name
        });
      }
    });
});

app.post('/api/ticket', (req, res) => {
  const ticket = new Ticket({
    name: req.body.ticket.name,
    numberOfSeats: req.body.ticket.numberOfSeats,
    sessionId: req.body.ticket.sessionId
  });

  ticket.save(err => {
    if (err) {
      return res.status(500).json({ message: 'Запрос не выполнен' });
    }

    Session.updateOne(
      { _id: req.body.ticket.sessionId },
      { $inc: { emptySeats: -req.body.ticket.numberOfSeats } },
      (err, data) => {
        if (err) {
          return res.status(500).json({ message: 'Запрос не выполнен' });
        }
        res.json({
          message: 'Билет сохранен'
        });
      }
    );
  });
});
app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));
