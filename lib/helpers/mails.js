'use strict';

const config = require('../config');

const mailgun_api_key = config.mailgun_api_key || 'apikey';
const mailgun_domain = config.mailgun_domain || 'domain';
const mailgun = require('mailgun-js')({ apiKey: mailgun_api_key, domain: mailgun_domain });

// todo define templates for different mails
const sendMail = function sendMail (template, user) {

  let message = '';
  switch (template) {
    case 'newUser':
      message = `Hello ${user.userName}, You have successfully registered for OriGami!`
      break;
    case 'resetPassword':
      message = `Hello ${user.userName}, You have request to change your password. Click this url and enter your new password! If you didn't request this please ignore it!`
      break;
    default:
      break;
  }

  const data = {
    from: 'postmaster@ori-gami.org',
    to: user.email,
    subject: 'Registered',
    text: `Hello ${user.userName}, You have successfully registered for OriGami!`
  };
  mailgun
    .messages()
    .send(data)
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error;
    });
};

module.exports = {
  sendMail: sendMail
};
