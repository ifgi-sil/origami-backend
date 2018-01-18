'use strict';

const jwt = require('restify-jwt');
const config = require('../config');
const { model: User } = require('../models/user');

const isRevokedCallback = function (req, payload, done) {
  const jwtString = req.headers.authorization.split(' ')[1];
  if (User.isTokenBlacklisted(payload, jwtString)) {
    return done(err);
  }

  req._jwt = jwtString;
  return done(null, false);
}

const auth = jwt({
  secret: config.jwt_secret,
  isRevoked: isRevokedCallback
});

module.exports = {
  auth
}