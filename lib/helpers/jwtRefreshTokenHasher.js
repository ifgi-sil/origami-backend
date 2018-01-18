'use strict';

const crypto = require('crypto'),
  config = require('../config');

const hashJWT = function hashJWT (jwtString) {
  if (typeof jwtString !== 'string') {
    throw new Error('method hashJWT expects a string parameter');
  }

  return crypto
    .createHmac(config.jwt_algorithm, config.jwt_secret)
    .update(jwtString)
    .digest('base64');
};

module.exports = hashJWT;