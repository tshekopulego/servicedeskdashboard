/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var IssueStatus = require('./issuestatus.model');

exports.register = function(socket) {
  IssueStatus.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  IssueStatus.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('issuestatus:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('issuestatus:remove', doc);
}
