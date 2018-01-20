'use strict';

const { mongoose } = require('../db');
const Schema = mongoose.Schema;

const iconSchema = new Schema({
  type: String,
  icon: String,
  markerColor: String,
  shape: String,
  number: Number,
  draggable: Boolean
});

module.exports = iconSchema;
