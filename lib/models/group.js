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

groupSchema.statics.addUser = function addUser (params) {
  return this
    .findOne({ _id: params.groupId })
    .exec()
    .then(function (group) {
      if (!group) {
        throw new Error('Group doesn`t exist', { type: 'ForbiddenError' });
      }

      group.members.addToSet(params.user);

      return group.save();
    });
};

groupSchema.statics.removeUser = function removeUser (params) {
  return this
    .findOne({ _id: params.groupId })
    .exec()
    .then(function (group) {
      if (!group) {
        throw new Error('Group doesn`t exist', { type: 'ForbiddenError' });
      }

      group.members.pull(params.user);

      return group.save();
    });
};

const groupModel = mongoose.model('Group', groupSchema);

module.exports = {
  schema: groupSchema,
  model: groupModel
};
