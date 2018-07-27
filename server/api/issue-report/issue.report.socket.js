/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var IssueReport = require('./issue.report.model');

exports.register = function(socket) {
  Issue.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  IssueReport.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('issuereport:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('issuereport:remove', doc);
}
