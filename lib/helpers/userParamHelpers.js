'use strict';

const handleError = require('./errorHandler');

const checkPrivilege = function checkPrivilege (req, res, next) {
  if (req.params.gameId) {
    try {
      req._user.checkGameOwner(req.params.gameId);

      return next();
    } catch (error) {
      return handleError(error, next);
    }
  }

  return next(new Error('Not signed in or not authorized to access.'));
};

module.exports = {
  checkPrivilege
};
