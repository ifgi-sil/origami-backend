'use strict';

const { mongoose } = require('../db');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const config = require('../config');
const jwt = require('jsonwebtoken');

const userSchema = new Schema({
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
  registerDate: {
    type: Date,
    required: true
  },
  // birthday: {
  //   type: String,
  //   required: false
  // },
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
  }, config.jwt_secret); // DO NOT KEEP YOUR SECRET IN THE CODE!
};

userSchema.pre('save', function (next) {
  console.log('run before save');
  next();
});

userSchema.post('save', function () {
  //TODO send mail after saving a new user
});

const userModel = mongoose.model('User', userSchema);

module.exports = {
  schema: userSchema,
  model: userModel
};
