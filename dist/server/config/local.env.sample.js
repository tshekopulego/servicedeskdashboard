'use strict';

// Use local.env.js for environment variables that grunt will set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
  DOMAIN: 'http://localhost:9000',
  SESSION_SECRET: "servicedesk-secret",

  FACEBOOK_ID: 'app-id',
  FACEBOOK_SECRET: 'secret',

  TWITTER_ID: 'app-id',
  TWITTER_SECRET: 'secret',

  GOOGLE_ID: 'app-id',
  GOOGLE_SECRET: 'secret',

  // Control debug level for modules using visionmedia/debug
  DEBUG: '',

  MAIL_SERVICE:"Mailgun", // sets automatically host, port and connection security settings
  MAIL_USER: "tsheko.mashego@gmail.com",
  MAIL_PASS: "Tsheko1",
  MAIL_FROM_NAME: "Tshwane Safety",
  MAIL_FROM_ADDRESS: "info@pulego.co.za",
  MAIL_CONFIRMATION_SECRET: "mailconfsecret",
  PASSWORD_RESET_SECRET: "pwdresetsecret"
};
