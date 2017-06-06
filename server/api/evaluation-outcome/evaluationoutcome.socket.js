/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var evaluationoutcome = require('./evaluationoutcome.model');

exports.register = function(socket) {
  Evaluationoutcome.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Evaluationoutcome.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('evaluationoutcome:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('evaluationoutcome:remove', doc);
}
