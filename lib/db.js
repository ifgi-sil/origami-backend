'use strict';

const config = require('./config');

// Bring mongoose into the app
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const serverOptions = {
  auto_reconnect: true,
  reconnectTries: Number.MAX_VALUE,
  socketOptions: {
    keepAlive: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000
  }
};

const connect = function connect (connectionString) {

  if (!connectionString) {
    connectionString = config.dbconnectionstring;
  }

  mongoose.connection.on('connecting', () => {
    console.info('trying to connect to MongoDB...');
  });

  // Create the database connection
  return new Promise((resolve, reject) => {
    mongoose.connect(connectionString, {
      keepAlive: 10000,
      server: serverOptions,
      replset: serverOptions,
      promiseLibrary: global.Promise
    })
      .then(() => {
        mongoose.connection.on('error', (err) => {
          console.log(err, 'Mongoose connection error');
        });

        mongoose.connection.on('disconnected', () => {
          console.warn('Mongoose connection disconnected. Retrying with mongo AutoReconnect.');
        });

        mongoose.connection.on('reconnected', () => {
          console.info('Mongoose connection reconnected.');
        });

        console.info('Successfully connected to MongoDB.');

        return resolve();
      })
      .catch((err) => {
        if (err.message.startsWith('failed to connect to server')) {
          console.info(`Error ${err.message} - retrying manually in 1 second.`);
          mongoose.connection.removeAllListeners();

          return new Promise(() => {
            setTimeout(() => {
              resolve(connect());
            }, 1000);
          });
        }

        return reject(err);
      });
  });
};

module.exports = {
  connect,
  mongoose
};
