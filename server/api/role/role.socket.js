/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Role = require('./role.model');

exports.register = function(socket) {
  Role.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Role.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('Role:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('Role:remove', doc);
}
