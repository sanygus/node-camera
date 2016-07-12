const ioClient = require('socket.io-client');
const log = require('./log');
let socket = {};

module.exports.init = function connectionStart(srvAddr) {
  socket = ioClient.connect(srvAddr);

  socket.on('connect', () => {
    log(`connected to server ${srvAddr}`);
  });

  socket.on('disconnect', () => {
    log('disconnected from server');
  });

  socket.on('error', (err) => {
    log('connection error');
    throw err;
  });
};

module.exports.getSocket = function getSocket(callback) {
  callback(null, socket);
};
