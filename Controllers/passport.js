const passport = require('passport');
const passportJWT = require('passport-jwt');
const User = require('../models/User');
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('JWT');
jwtOptions.secretOrKey = 'secretKey';

const strategy = new JwtStrategy(jwtOptions, (jwt_payload, next) => {
  let user = User.findById(jwt_payload.id);
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});

passport.use(strategy);

module.exports = {
  jwtOptions,
  initialize: function() {
    return passport.initialize();
  },
  authenticate: function() {
    return passport.authenticate('jwt', { session: false });
  }
};
