'use strict';

const { mongoose } = require('../db');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
  name: 'string',
  size: 'string'
});

gameSchema.statics.findAllGames = function findAllGames (opts = {}) {
  const schema = this;

  return schema.find(opts);
};

const gameModel = mongoose.model('Game', gameSchema);

module.exports = {
  schema: gameSchema,
  model: gameModel
};
