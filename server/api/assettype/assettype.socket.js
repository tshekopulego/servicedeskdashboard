/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Assettype = require('./assettype.model');

exports.register = function(socket) {
  Assettype.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Assettype.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('assettype:save', doc);
}

function onRemove(socket, doc, cb) 
  socket.emit('assettype:remove', doc);
}
