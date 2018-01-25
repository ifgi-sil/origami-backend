'use strict';

const { model: Group } = require('../models/group');
const { model: User } = require('../models/user');
const handleError = require('../helpers/errorHandler');

const getOwnGroups = function getOwnGroups (req, res, next) {
  Group
    .find({ owner: req._user })
    .then(function (groups) {
      res.send(200, { code: 'Ok', message: 'Group created.', data: { result: groups } });
    })
    .catch(function (err) {
      handleError(err, next);
    });
};

const getGroupById = function getGroupById (req, res, next) {
  Group
    .findById(req.params.groupId)
    .then(function (group) {
      res.send(200, { code: 'Ok', message: 'Group created.', data: { result: group } });
    })
    .catch(function (err) {
      handleError(err, next);
    });
};

const createGroup = function createGroup (req, res, next) {
  req.params.owner = req._user;
  Group
    .createGroup(req.params)
    .then(function (newGroup) {
      User
        .find({ userName: { $in: req.params.members } })
        .then(function (users) {

          for (const user of users) {
            newGroup.members.addToSet(user._id);
          }

          newGroup
            .save()
            .then(function () {
              res.send(200, { code: 'Ok', message: 'Group created.', data: { result: newGroup } });
            });
        })
        .catch((err) => {
          handleError(err, next);
        });
    })
    .catch((err) => {
      handleError(err, next);
    });
};

const deleteGroup = function deleteGroup (req, res, next) {
  Group
    .findOneAndRemove({ _id: req.params.groupId })
    .then(function (removedGroup) {
      res.send(200, { code: 'Ok', message: 'Group deleted.', data: { result: removedGroup } });
      //TODO remove from games
    })
    .catch(function (err) {
      handleError(err, next);
    });
};

const updateGroup = function updateGroup (req, res, next) {

};

const addUser = function addUser (req, res, next) {
  Group
    .addUser(req.params)
    .then(function (group) {
      res.send(200, { code: 'Ok', message: 'User added to group.', data: { result: group } });
    })
    .catch(function (err) {
      handleError(err, next);
    });
};

const removeUser = function removeUser (req, res, next) {
  Group
    .removeUser(req.params)
    .then(function (group) {
      res.send(200, { code: 'Ok', message: 'User removed from group.', data: { result: group } });
    })
    .catch(function (err) {
      handleError(err, next);
    });
};

module.exports = {
  getOwnGroups: getOwnGroups,
  getGroupById: getGroupById,
  createGroup: createGroup,
  deleteGroup: deleteGroup,
  updateGroup: updateGroup,
  addUser: addUser,
  removeUser: removeUser
};
