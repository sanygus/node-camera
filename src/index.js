var options = require('./camOptions');
var sensorSender = require('./sensorSender');
var statisticsSender = require('./statisticsSender');
var fileSender = require('./fileSender');
var photoShooter = require('./photoShooter');
var videoShooter = require('./videoShooter');
var socket = require('socket.io-client').connect(options.serverAddress);
var log = require('./log');

socket.on('connect', function cb() {
  log('connected to server ' + options.serverAddress);
});

socket.on('disconnect', function cb() {
  log('disconnected from server');
});

sensorSender(socket);
statisticsSender(socket, options.statisticsSenderInterval, options.systemStatInterval);
fileSender(socket, options.filesDir, options.fileSenderInterval);
photoShooter();
videoShooter();

photoShooter.on();
