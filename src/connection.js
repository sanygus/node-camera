var ioClient = require('socket.io-client');
var log = require('./log');
var socket = {};

module.exports = function connectionStart(srvAddr) {
  socket = ioClient.connect(srvAddr);

  socket.on('connect', function cb() {
    log('connected to server ' + srvAddr);
  });

  socket.on('disconnect', function cb() {
    log('disconnected from server');
  });

  socket.on('error', function cb(err) {
    log('connection error');
    throw err;
  });
};

module.exports.getSocket = function getSocket(callback) {
  callback(null, socket);
};
