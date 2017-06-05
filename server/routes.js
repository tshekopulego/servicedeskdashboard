/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/admin', require('./api/admin'));
  app.use('/api/division', require('./api/division'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/issues', require('./api/issues'));
  app.use('/api/category', require('./api/category'));
  app.use('/api/issue-status', require('./api/issue-status'));
  app.use('/api/priority', require('./api/priority'));
  app.use('/api/channel', require('./api/channel'));
  app.use('/api/rfc-calls', require('./api/rfc-calls'));
  app.use('/api/ictstore', require('./api/ictstore'));
  app.use('/api/ictasset', require('./api/ictasset'));
  app.use('/api/request-type', require('./api/request-type'));
  app.use('/api/priority', require('./api/priority'));
  app.use('/api/evaluation-outcome', require('./api/evaluation-outcome'));
  	
  app.use('/auth', require('./auth'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
