'use strict';

const { mongoose } = require('../db');
const Schema = mongoose.Schema;

const questionSchema = require('./question');
const answerSchema = require('./answer');

const taskSchema = new Schema({
  type: {
    type: String,
    required: true
  },
  question: questionSchema,
  answers: [answerSchema]
});

module.exports = taskSchema;
