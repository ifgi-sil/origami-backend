'use strict';

const { model: User } = require('../models/user');
const handleError = require('../helpers/errorHandler');

const registerUser = function (req, res, next) {
  const { firstName, lastName, email, password, userName } = req.params;
  const registerDate = Date.now();
  const user = new User({ firstName, lastName, userName, email, password, registerDate });
  user
    .save()
    .then(user => {
      return res.send(201, { code: 'Created', message: 'Successfully registered new user', data: user });
    })
    .catch(err => {
      handleError(err, next);
    });
//   new User({ firstName, lastName, userName, email, password })
//     .save()
//     .then(function (newUser) {
//       return newUser.createToken()
//         .then(function ({ token, refreshToken }) {
//           return res.send(201, { code: 'Created', message: 'Successfully registered new user', data: { user: newUser }, token, refreshToken });
//         })
//         .catch(function (err) {
//           next(err);
//         //   next(new InternalServerError(`User successfully created but unable to create jwt token: ${err.message}`));
//         });
//     })
//     .catch(function (err) {
//     //   handleError(err, next);
//     });
};

module.exports = {
  registerUser: registerUser
};
