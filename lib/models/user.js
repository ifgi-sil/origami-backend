'use strict';

const { mongoose } = require('../db');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const config = require('../config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mails = require('../mails');

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
  hashedPassword: {
    type: String,
    required: true
  }
});

userSchema.virtual('password')
  .get(function () {
    return this._password;
  })
  .set(function (value) {
    this._password = value;
    this.hashedPassword = 'If this is here, it means there was an error';
  });

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

const preparePasswordHash = function preparePasswordHash (plaintextPassword) {
  // first round: hash plaintextPassword with sha512
  const hash = crypto.createHash('sha512');
  hash.update(plaintextPassword.toString(), 'utf8');
  const hashed = hash.digest('base64'); // base64 for more entropy than hex

  return hashed;
};

const passwordHasher = function passwordHasher (plaintextPassword) {
  return bcrypt.hash(preparePasswordHash(plaintextPassword), 1); // signature <String, Number> generates a salt and hashes in one step
};

userSchema.pre('save', function userPreHashPassword (next) {
  const user = this;

  if (!user._password) {
    return next();
  }

  passwordHasher(user._password)
    .then(function (hashedPassword) {
      user._password = undefined;
      user.hashedPassword = hashedPassword;
      next();
    })
    .catch(function (err) {
      next(err);
    });
});

userSchema.methods.checkPassword = function checkPassword (plaintextPassword) {
  return bcrypt.compare(preparePasswordHash(plaintextPassword), this.hashedPassword)
    .then(function (passwordIsCorrect) {
      if (passwordIsCorrect === false) {
        throw new Error('Password incorrect', { type: 'ForbiddenError' }); //ModelError
      }

      return true;
    });
};

userSchema.pre('save', function userPreSave (next) {
  this.wasNew = this.isNew;
  next();
});

// runs after successful save of users
userSchema.post('save', function userPostSaveSendMails (user) {
  if (user.wasNew) {
    user.mail('newUser');
    //TODO return
  }

  // if (user.unconfirmedEmail) {
  //   user.mail('confirmEmail');
  // }
});

userSchema.methods.mail = function mail () {
  // TODO send mail, create own module
  return mails.sendMail();
};

const userModel = mongoose.model('User', userSchema);

module.exports = {
  schema: userSchema,
  model: userModel
};
