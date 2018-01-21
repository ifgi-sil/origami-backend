'use strict';

const { model: Group } = require('../models/group');
const { model: User } = require('../models/user');
const handleError = require('../helpers/errorHandler');

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

};

const updateGroup = function updateGroup (req, res, next) {

};

module.exports = {
  createGroup: createGroup,
  deleteGroup: deleteGroup,
  updateGroup: updateGroup
};
