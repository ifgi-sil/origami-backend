'use strict';

const { model: Game } = require('../models/game');
const handleError = require('../helpers/errorHandler');

const getGames = function (req, res, next) {
  res.header('Content-Type', 'application/json; charset=utf-8');
  Game.findAllGames()
    .then((games) => {
      res.end(JSON.stringify(games));
    })
    .catch((err) => {
      res.writeHead(400);
      res.end(JSON.stringify(err));
    });

  return next();
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

module.exports = {
  getGames: getGames,
  postNewGame: postNewGame,
  updateGame: updateGame,
  deleteGame: deleteGame
};
