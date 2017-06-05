/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var ICTStore = require('./ictstore.model');

exports.register = function(socket) {
  ICTStore.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  ICTStore.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('ictstore:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('ictstore:remove', doc);
}
