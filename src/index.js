var options = require('./camOptions');
var sensorSender = require('./sensorSender');
var fileSender = require('./fileSender');
var photoShooter = require('./photoShooter');
var videoShooter = require('./videoShooter');
var socket = require('socket.io-client').connect(options.serverAddress);

socket.on('connect', function cb() {
  console.log('connected to server ', options.serverAddress);
});

socket.on('disconnect', function cb() {
  console.log('disconnected from server');
});

sensorSender(socket);
fileSender(socket, options.filesDir, options.fileSenderInterval);
photoShooter();
videoShooter();
