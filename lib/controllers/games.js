'use strict';

const { model: Game } = require('../models/game');
const { model: User } = require('../models/user');
const handleError = require('../helpers/errorHandler');
const { checkPrivilege } = require('../helpers/userParamHelpers');

const getGames = function (req, res, next) {
  res.header('Content-Type', 'application/json; charset=utf-8');
  Game.findAllGames({ private: false })
    .then((games) => {
      res.end(JSON.stringify(games));
    })
    .catch((err) => {
      res.writeHead(400);
      res.end(JSON.stringify(err));
    });

  return next();
};

const getGame = function getGame (req, res, next) {

};

const postNewGame = function (req, res, next) {
  req._user.addGame(req.params)
    .then(function (newGame) {
      res.send(201, { message: 'Game successfully created', data: newGame });
    })
    .catch(function (err) {
      handleError(err, next);
    });
};

const updateGame = function updateGame (req, res, next) {

};

const deleteGame = function deleteGame (req, res, next) {

};

const getAllUsersFromGame = function getAllUsersFromGame (req, res, next) {

};

const addUserToGame = function addUserToGame (req, res, next) {
  Game
    .addPlayer(req.params)
    .then(function (game) {
      User
        .addInvitedGame({ email: req.params.email, gameId: game._id })
        .then(function () {
          res.send(200, { code: 'Ok', message: 'Player added to game.', data: { result: game } });
        });
    })
    .catch(function (err) {
      handleError(err, next);
    });
};

const removeUserFromGame = function removeUserFromGame (req, res, next) {

};

const addGroupToGame = function addGroupToGame (req, res, next) {
  Game
    .addGroup(req.params)
    .then(function (game) {
      res.send(200, { code: 'Ok', message: 'Group added to game.', data: { result: game } });
    })
    .catch(function (err) {
      handleError(err, next);
    });
};

const removeGroupFromGame = function removeGroupFromGame (req, res, next) {
  Game
    .removeGroup(req.params)
    .then(function (game) {
      res.send(200, { code: 'Ok', message: 'Group removed from game.', data: { result: game } });
    })
    .catch(function (err) {
      handleError(err, next);
    });
};

module.exports = {
  getGames: getGames,
  getGame: getGame,
  postNewGame: postNewGame,
  updateGame: [
    checkPrivilege,
    updateGame
  ],
  deleteGame: [
    checkPrivilege,
    deleteGame
  ],
  getAllUsersFromGame: getAllUsersFromGame,
  addUserToGame: [
    checkPrivilege,
    addUserToGame
  ],
  removeUserFromGame: [
    checkPrivilege,
    removeUserFromGame
  ],
  addGroupToGame: [
    checkPrivilege,
    addGroupToGame
  ],
  removeGroupFromGame: [
    checkPrivilege,
    removeGroupFromGame
  ]
};
