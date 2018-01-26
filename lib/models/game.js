'use strict';

const { mongoose } = require('../db');
const Schema = mongoose.Schema;
const waypointSchema = require('./waypoint');

const gameSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true
  },
  timecompl: {
    type: Number
  },
  difficulty: {
    type: Number,
    min: 0,
    max: 5,
    default: 1
  },
  private: {
    type: Boolean,
    default: false
  },
  waypoints: [waypointSchema],
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'User'
  }],
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'Group'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// only send out names and email..
gameSchema.set('toJSON', {
  version: false,
  transform: function transform (doc, ret) {
    const { name, description, type, timecompl, difficulty } = ret;

    return { name, description, type, timecompl, difficulty };
  }
});

// initializes and saves new game document
gameSchema.statics.initNew = function (params) {
  // create game document and persist in database
  return this.create({
    name: params.name,
    type: params.type,
    description: params.description,
    timecompl: params.timecompl,
    difficulty: params.difficulty,
    private: params.private,
    waypoints: params.waypoints
  });
};

gameSchema.statics.findAllGames = function findAllGames (opts = {}) {
  const schema = this;

  return schema.find(opts);
};

gameSchema.statics.addGroup = function addGroup (params) {
  return this
    .findOne({ _id: params.gameId })
    .exec()
    .then(function (game) {
      if (!game) {
        throw new Error('Game doesn`t exist', { type: 'ForbiddenError' });
      }

      game.groups.addToSet(params.group);

      return game.save();
    });
};

gameSchema.statics.removeGroup = function removeGroup (params) {
  return this
    .findOne({ _id: params.gameId })
    .exec()
    .then(function (game) {
      if (!game) {
        throw new Error('Game doesn`t exist', { type: 'ForbiddenError' });
      }

      game.groups.pull(params.group);

      return game.save();
    });
};

const gameModel = mongoose.model('Game', gameSchema);

module.exports = {
  schema: gameSchema,
  model: gameModel
};
