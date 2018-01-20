'use strict';

const { mongoose } = require('../db');
const Schema = mongoose.Schema;

const taskSchema = require('./task');
const iconSchema = require('./icon');

const waypointSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  tasks: [taskSchema],
  icon: iconSchema
});

module.exports = waypointSchema;
