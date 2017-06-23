/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Getcalleroversla = require('./getcalleroversla.model');

exports.register = function(socket) {
  Getcalleroversla.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Getcalleroversla.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('getcalleroversla:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('getcalleroversla:remove', doc);
}
