/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Hardware = require('./hardware.model');

exports.register = function(socket) {
  Hardware.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Hardware.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('hardware:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('hardware:remove', doc);
}
