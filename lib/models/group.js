'use strict';

const { mongoose } = require('../db');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'User'
  }]
});

groupSchema.statics.createGroup = function createGroup (params) {
  return this.create({
    name: params.name,
    owner: params.owner,
    members: params.memebers,
  });
};

const groupModel = mongoose.model('Group', groupSchema);

module.exports = {
  schema: groupSchema,
  model: groupModel
};
