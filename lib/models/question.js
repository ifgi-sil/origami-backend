'use strict';

const { mongoose } = require('../db');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  txt: {
    type: String,
    required: true
  },
  img: {
    type: String,
    required: false
  }
});

module.exports = questionSchema;