// specify your config items
// environment variables starting with `origami_` will override the values here.
// Example: `origami_database` will override the setting for `database`

'use strict';

const config = {
  dbhost: 'localhost:27017',
  dbuser: 'admin',
  dbuserpass: 'admin',
  database: 'origami-api',
  mailgun_api_key: 'api_key',
  mailgun_domain: 'domain',
  jwt_secret: 'MY_SECRET',
  port: 5000,
  basePath: '/games'
};

let env_has_dbconnectionstring = false;
for (const envKey in process.env) {
  if (envKey.indexOf('origami_') === 0) {
    const configKey = envKey.substring(8);
    if (env_has_dbconnectionstring === false && configKey === 'dbconnectionstring') {
      env_has_dbconnectionstring = true;
    }
    config[configKey] = process.env[envKey];
  }
}

if (env_has_dbconnectionstring === false) {
  config.dbconnectionstring = `${config.dbuser}:${config.dbuserpass}@${config.dbhost}/${config.database}?authSource=${config.database}`;
}

// freeze config so that its not mutuable
module.exports = Object.freeze(config);
