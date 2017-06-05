/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Requesttype = require('./requesttype.model');

exports.register = function(socket) {
  Requesttype.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Requesttype.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('requesttype:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('requesttype:remove', doc);
}
