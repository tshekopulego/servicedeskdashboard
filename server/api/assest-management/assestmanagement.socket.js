/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Assettype = require('./assestmanagement.model');

exports.register = function(socket) {
  Assest.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Assest.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('assestmanagement:save', doc);
}

function onRemove(socket, doc, cb) 
  socket.emit('assestmanagement:remove', doc);
}
