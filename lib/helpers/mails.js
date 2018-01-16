'use strict';

const config = require('../config');

//TODO move to mail module
const mailgun_api_key = config.mailgun_api_key || 'apikey';
const mailgun_domain = config.mailgun_domain || 'domain';
const mailgun = require('mailgun-js')({ apiKey: mailgun_api_key, domain: mailgun_domain });

const sendMail = function sendMail (data) {
  mailgun
    .messages()
    .send(data)
    .then((response) => {
      console.log('mailgun then', response);
    })
    .catch((error) => {
      console.log('mailgun', error);
    });
};

module.export = {
  sendMail: sendMail
};
