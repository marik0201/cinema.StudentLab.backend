const express = require('express');
const auth = require('./auth');
const films = require('./films');
const sessions = require('./sessions');
const tickets = require('./tickets');
const user = require('./user');
const passport = require('../Service/UserAuthenticate');
const router = express.Router();

router.use('/api/auth', auth);
router.use('/api/tickets', passport.authenticate(), tickets);
router.use('/api/films', films);
router.use('/api/sessions', sessions);
router.use('/api/user', passport.authenticate(), user);

module.exports = router;
