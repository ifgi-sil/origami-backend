'use strict';

const jwt = require('restify-jwt');
const config = require('../config');
const { model: User } = require('../models/user');
const handleError = require('./errorHandler');

const isRevokedCallback = function (req, payload, done) {
  const jwtString = req.headers.authorization.split(' ')[1];
  if (User.isTokenBlacklisted(payload, jwtString)) {
    return done(null, true, { error: 'JWT_WRONG_OR_UNAUTHORIZED' });
  }

  req._jwt = payload;
  req._jwtString = jwtString;

  User
    .findOne({ email: payload.email })
    .exec()
    .then((user) => {
      if (!user) {
        return done(null, true, { error: 'JWT_WRONG_OR_UNAUTHORIZED' });
      }

      req._user = user;

      return done(null, false);
    })
    .catch(() => {
      done(null, true, { error: 'JWT_WRONG_OR_UNAUTHORIZED' });
    });
};

const auth = jwt({
  secret: config.jwt_secret,
  isRevoked: isRevokedCallback
});

const checkUserAndPassword = function (req, res, next) {
  // lowercase for email
  User
    .findOne({ email: req.params.email })
    .exec()
    .then(function (user) {
      if (!user) {
        handleError(new Error('MSG_CREDENTIALS_WRONG'), next);
      }

      return user.checkPassword(req.params.password)
        .then(function () {
          req._user = user;

          return next(user);
        });
    })
  /* eslint-disable no-unused-vars */
    .catch(function (err) {
      if (err.name === 'ModelError' && err.message === 'Password incorrect') {
        handleError(err, next);
      }

      handleError(err, next);
    });
  /* eslint-enable no-unused-vars */
};

module.exports = {
  auth,
  checkUserAndPassword
};
