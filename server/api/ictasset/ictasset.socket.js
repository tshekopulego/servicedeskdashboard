/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var ICTAsset = require('./ictasset.model');

exports.register = function(socket) {
  ICTAsset.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  ICTAsset.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('ictasset:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('ictasset:remove', doc);
}
