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

module.exports = {
  registerUser: registerUser
};
