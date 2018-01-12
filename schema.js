'use strict';

const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const cfg = require('./config');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  userName: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  registrDate: {
    type: Date,
    required: true
  },
  birthday: {
    type: String,
    required: false
  },
  info: {
    type: String,
    required: false
  },
  friends: [{
    type: String,
    required: true
  }],
  games: [{
    type: String,
    required: false
  }],
  hash: String,
  salt: String
});

userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex');
};

userSchema.methods.validPassword = function (password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex');

  return this.hash === hash;
};

userSchema.methods.generateJwt = function () {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign({
    _id: this._id,
    email: this.email,
    userName: this.userName,
    exp: parseInt(expiry.getTime() / 1000),
  }, cfg.jwt_secret); // DO NOT KEEP YOUR SECRET IN THE CODE!
};

const User = mongoose.model('User', userSchema);
