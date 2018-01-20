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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
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

const gameModel = mongoose.model('Game', gameSchema);

module.exports = {
  schema: gameSchema,
  model: gameModel
};
