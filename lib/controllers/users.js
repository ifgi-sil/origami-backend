'use strict';

const { model: User } = require('../models/user');
const handleError = require('../helpers/errorHandler');

const registerUser = function (req, res, next) {
  const { firstName, lastName, email, password, userName } = req.params;
  const registerDate = Date.now();
  User.count({ $or: [{ userName: userName }, { email: email }] })
    .then(function (count) {
      if (count > 0) {
        return res.send(404, 'User already exists');
      }

      // Create new user
      const newUser = new User({ firstName, lastName, userName, email, password, registerDate });
      newUser
        .save()
        .then((newUser) => {
          const token = newUser.generateJwt();

          return res.send(201, { code: 'Created', message: 'Successfully registered new user', data: { user: newUser }, token });
        })
        .catch((err) => {
          handleError(err, next);
        });
    });
};

const login = function (req, res) {
  const token = req._user.generateJwt();
  res.send(200, { code: 'Logged in', message: 'Successfully logged in.', data: { user: req._user }, token });
};

const logout = function (req, res) {
  req._user.logout(req);
  res.send(200, { code: 'Ok', message: 'Successfully signed out' });
};

const updatePassword = function (req, res, next) {

};

const requestResetPassword = function (req, res, next) {
  User.initPasswordReset(req.params)
    .then(function () {
      res.send(200, { code: 'Ok', message: 'Password reset initiated' });
    })
    .catch(function (err) {
      handleError(err, next);
    });
};

const resetPassword = function (req, res, next) {
  User.resetPassword(req.params)
    .then(() => {
      res.send(200, { code: 'Ok', message: 'Password succesfully changed. You can now login with your new password!' });
    })
    .catch((err) => {
      handleError(err, next);
    });
};

const confirmEmailAddress = function confirmEmailAddress (req, res, next) {

};

const getProfile = function (req, res) {
  res.send(200, { code: 'Ok', data: { profile: req._user } });
};

const updateProfile = function (req, res, next) {

};

const deleteProfile = function (req, res, next) {

};

module.exports = {
  registerUser: registerUser,
  login: login,
  logout: logout,
  updatePassword: updatePassword,
  requestResetPassword: requestResetPassword,
  resetPassword: resetPassword,
  confirmEmailAddress: confirmEmailAddress,
  getProfile: getProfile,
  updateProfile: updateProfile,
  deleteProfile: deleteProfile
};
