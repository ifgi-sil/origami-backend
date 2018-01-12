'use strict';

const { model: Game } = require('../models/game');

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

module.exports = {
  getGames: getGames
};
