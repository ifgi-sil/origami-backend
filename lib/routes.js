'use strict';

const { basePath, userPath } = require('./config');
const { GamesController, UsersController } = require('./controllers');
const { auth, checkUserAndPassword } = require('./helpers/authHelpers');

const spaces = function spaces (num) {
  let str = ' ';
  for (let i = 1; i < num; i++) {
    str = `${str} `;
  }

  return str;
};

const printRoutes = function printRoutes (req, res) {
  res.header('Content-Type', 'text/plain; charset=utf-8');

  const lines = [
    'This is the OriGami API running on https://api.ori-gami.org',
    'Revision: softwareRevision',
    '',
    'Routes requiring no authentication:'
  ];

  const longestRoute = 37;

  for (const route of routes.noauth) {
    let method = route.method.toLocaleUpperCase();
    if (method === 'DEL') {
      method = 'DELETE';
    } else {
      method = `${method}${spaces(6 - method.length)}`;
    }

    lines.push(`${method} ${route.path}${spaces(longestRoute - route.path.length)}`);
  }

  lines.push('');
  lines.push('Routes requiring valid authentication through JWT:');

  for (const route of routes.auth) {
    let method = route.method.toLocaleUpperCase();
    if (method === 'DEL') {
      method = 'DELETE';
    } else {
      method = `${method}${spaces(6 - method.length)}`;
    }

    lines.push(`${method} ${route.path}${spaces(longestRoute - route.path.length)}`);
  }

  res.end(lines.join('\n'));
};

// the ones matching first are used
// case is ignored
const routes = {
  'noauth': [
    { path: '/', method: 'get', handler: printRoutes },
    { path: `${basePath}`, method: 'get', handler: GamesController.getGames },
    { path: `${userPath}/register`, method: 'post', handler: UsersController.registerUser },
    { path: `${userPath}/login`, method: 'post', handler: [ checkUserAndPassword, UsersController.login ] },
    { path: `${userPath}/request-password-reset`, method: 'post', handler: UsersController.requestResetPassword },
    { path: `${userPath}/password-reset`, method: 'post', handler: UsersController.resetPassword },
    // { path: `${basePath}/data`, method: 'get', handler: measurementsController.getDataMulti, reference: 'api-Measurements-getDataMulti' },
    // { path: `${basePath}/:boxId`, method: 'get', handler: boxesController.getBox, reference: 'api-Boxes-getBox' },
    // { path: `${basePath}/:boxId/sensors`, method: 'get', handler: measurementsController.getLatestMeasurements, reference: 'api-Measurements-getLatestMeasurements' },
    // { path: `${basePath}/:boxId/data/:sensorId`, method: 'get', handler: measurementsController.getData, reference: 'api-Measurements-getData' },
    // { path: `${basePath}/:boxId/locations`, method: 'get', handler: boxesController.getBoxLocations, reference: 'api-Measurements-getLocations' },
    // { path: `${basePath}/data`, method: 'post', handler: measurementsController.getDataMulti, reference: 'api-Measurements-getDataMulti' },
    // { path: `${basePath}/:boxId/data`, method: 'post', handler: measurementsController.postNewMeasurements, reference: 'api-Measurements-postNewMeasurements' },
    // { path: `${basePath}/:boxId/:sensorId`, method: 'post', handler: measurementsController.postNewMeasurement, reference: 'api-Measurements-postNewMeasurement' },
    // { path: `${userPath}/request-password-reset`, method: 'post', handler: usersController.requestResetPassword, reference: 'api-Users-request-password-reset' },
    // { path: `${userPath}/password-reset`, method: 'post', handler: usersController.resetPassword, reference: 'api-Users-password-reset' },
    // { path: `${userPath}/confirm-email`, method: 'post', handler: usersController.confirmEmailAddress, reference: 'api-Users-confirm-email' },
    // { path: `${userPath}/sign-in`, method: 'post', handler: [ checkUsernamePassword, usersController.signIn ], reference: 'api-Users-sign-in' },
    // { path: `${userPath}/refresh-auth`, method: 'post', handler: usersController.refreshJWT, reference: 'api-Users-refresh-auth' }
  ],
  'auth': [
    { path: `${userPath}/logout`, method: 'post', handler: UsersController.logout }
    // { path: `${userPath}/me`, method: 'get', handler: usersController.getUser, reference: 'api-Users-getUser' },
    // { path: `${userPath}/me`, method: 'put', handler: usersController.updateUser, reference: 'api-Users-updateUser' },
    // { path: `${userPath}/me/boxes`, method: 'get', handler: usersController.getUserBoxes, reference: 'api-Users-getUserBoxes' },
    // { path: `${basePath}/:boxId/script`, method: 'get', handler: boxesController.getSketch, reference: 'api-Boxes-getSketch' },
    // { path: `${basePath}`, method: 'post', handler: boxesController.postNewBox, reference: 'api-Boxes-postNewBox' },
    // { path: `${basePath}/:boxId`, method: 'put', handler: boxesController.updateBox, reference: 'api-Boxes-updateBox' },
    // { path: `${basePath}/:boxId`, method: 'del', handler: boxesController.deleteBox, reference: 'api-Boxes-deleteBox' },
    // { path: `${basePath}/:boxId/:sensorId/measurements`, method: 'del', handler: sensorsController.deleteSensorData, reference: 'api-Measurements-deleteMeasurements' },
    // { path: `${userPath}/sign-out`, method: 'post', handler: usersController.signOut, reference: 'api-Users-sign-out' },
    // { path: `${userPath}/me`, method: 'del', handler: usersController.deleteUser, reference: 'api-Users-deleteUser' },
    // { path: `${userPath}/me/resend-email-confirmation`, method: 'post', handler: usersController.requestEmailConfirmation, reference: 'api-Users-request-email-confirmation' }
  ]
};

const initRoutes = function initRoutes (server) {
  //attach routes
  console.log(basePath);
  for (const route of routes.noauth) {
    server[route.method]({ path: route.path }, route.handler);
  }

  // Attach secured routes (needs authorization through jwt)
  server.use(auth);

  for (const route of routes.auth) {
    server[route.method]({ path: route.path }, route.handler);
  }
};

module.exports = initRoutes;
