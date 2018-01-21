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
    { path: `${basePath}/:gameId`, method: 'get', handler: GamesController.getGame },
    { path: `${userPath}/register`, method: 'post', handler: UsersController.registerUser },
    { path: `${userPath}/login`, method: 'post', handler: [ checkUserAndPassword, UsersController.login ] },
    { path: `${userPath}/request-password-reset`, method: 'post', handler: UsersController.requestResetPassword },
    { path: `${userPath}/password-reset`, method: 'post', handler: UsersController.resetPassword },
    { path: `${userPath}/confirm-email`, method: 'post', handler: UsersController.confirmEmailAddress },
  ],
  'auth': [
    { path: `${userPath}/logout`, method: 'post', handler: UsersController.logout },
    { path: `${userPath}/profile`, method: 'get', handler: UsersController.getProfile },
    { path: `${userPath}/profile`, method: 'put', handler: UsersController.updateProfile },
    { path: `${userPath}/profile`, method: 'del', handler: UsersController.deleteProfile },
    { path: `${userPath}/profile/search`, method: 'post', handler: UsersController.searchProfile },
    { path: `${basePath}`, method: 'post', handler: GamesController.postNewGame },
    { path: `${basePath}/:gameId`, method: 'get', handler: GamesController.getGame },
    { path: `${basePath}/:gameId`, method: 'put', handler: GamesController.updateGame },
    { path: `${basePath}/:gameId`, method: 'del', handler: GamesController.deleteGame },
    { path: `${basePath}/:gameId/players`, method: 'get', handler: GamesController.getAllUsersFromGame },
    { path: `${basePath}/:gameId/players`, method: 'post', handler: GamesController.addUserToGame },
    { path: `${basePath}/:gameId/players`, method: 'del', handler: GamesController.removeUserFromGame },
  ]
};

const initRoutes = function initRoutes (server) {
  //attach routes
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
