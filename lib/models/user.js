'use strict';

const { mongoose } = require('../db');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const moment = require('moment');
const config = require('../config');
const jwt = require('jsonwebtoken');
const mails = require('../helpers/mails');
const tokenBlacklist = require('../helpers/tokenBlacklist');
const { model: Game } = require('./game');

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
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'Game'
  }],
  hashedPassword: {
    type: String,
    required: true
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
});

userSchema.virtual('password')
  .get(function () {
    return this._password;
  })
  .set(function (value) {
    this._password = value;
    this.hashedPassword = 'If this is here, it means there was an error';

    // also set resetPasswordToken
    this.resetPasswordToken = '';
    // set expires to one hour in the past
    this.resetPasswordExpires = moment.utc()
      .subtract(1, 'hour')
      .toDate();
  });

const jwtSignOptions = {
  algorithm: config.jwt_algorithm,
  issuer: config.jwt_issuer,
  expiresIn: Math.round(config.jwt_validity_ms / 1000)
};

userSchema.methods.generateJwt = function () {
  // const expiry = new Date();
  // expiry.setDate(expiry.getDate() + 7);

  const signOptions = Object.assign({ subject: this.email, jwtid: uuid() }, jwtSignOptions);

  return jwt.sign({
    _id: this._id,
    email: this.email,
    userName: this.userName,
  }, config.jwt_secret, signOptions);
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

userSchema.methods.logout = function logout (req) {
  tokenBlacklist.addTokenToBlacklist(req._jwt, req._jwtString);
};

userSchema.methods.deleteUser = function deleteUser (req) {
  const user = this;
  // sign out
  user.logout(req);

  return user
    .populate('games')
    .execPopulate()
    .then(function (userWithGames) {
      // userWithGames.sendMail('deleteUser', userWithGames);

      // delete the boxes..
      for (const game of userWithGames.games) {
        game
          .remove()
          .then(function () {
            console.log('removed game');
          });
      }

      return userWithGames.remove();
    });
};

userSchema.methods.addGame = function addGame (params) {
  const user = this;

  // initialize new box
  return Game
    .initNew(params)
    .then(function (savedGame) {
      // request is valid
      // persist the saved game in the user
      user.games.addToSet(savedGame._id);

      return user
        .save()
        .then(function () {
          // TODO mail user with new game
          return savedGame;
        });
    });
};

userSchema.statics.isTokenBlacklisted = function isTokenBlacklisted (jwt, jwtString) {
  return tokenBlacklist.isTokenBlacklisted(jwt, jwtString);
};

userSchema.pre('save', function userPreSave (next) {
  this.wasNew = this.isNew;
  next();
});

// runs after successful save of users
userSchema.post('save', function userPostSaveSendMails (user) {
  if (user.wasNew) {
    mails.sendMail('newUser', user);
  }
});

userSchema.statics.initPasswordReset = function initPasswordReset ({ email }) {
  return this.findOne({ email: email.toLowerCase() })
    .exec()
    .then(function (user) {
      if (!user) {
        throw new ModelError('Password reset for this user not possible', { type: 'ForbiddenError' });
      }

      user.resetPasswordToken = uuid();
      user.resetPasswordExpires = moment.utc()
        .add(12, 'hours')
        .toDate();

      return user.save()
        .then(function (savedUser) {
          return mails.sendMail('passwordReset', savedUser);
        });
    });
};

userSchema.statics.resetPassword = function resetPassword ({ password, token }) {
  return this.findOne({ resetPasswordToken: token })
    .exec()
    .then(function (user) {
      if (!user) {
        throw new ModelError('Password reset for this user not possible', { type: 'ForbiddenError' });
      }

      if (moment.utc().isAfter(moment.utc(user.resetPasswordExpires))) {
        throw new ModelError('Password reset token expired', { type: 'ForbiddenError' });
      }

      // set user specified password..
      // also changes the passwordResetToken
      user.set('password', password);

      return user.save();
    });
};

const userModel = mongoose.model('User', userSchema);

module.exports = {
  schema: userSchema,
  model: userModel
};
