/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Rfccall = require('./rfccall.model');

exports.register = function(socket) {
  Rfccall.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Rfccall.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('rfccall:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('rfccall:remove', doc);
}
