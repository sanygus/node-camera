var options = require('./camOptions');
var sensorSender = require('./sensorSender');
var fileSender = require('./fileSender');
var photoShooter = require('./photoShooter');
var videoShooter = require('./videoShooter');
var socket = require('socket.io-client').connect(options.serverAddress);
var log = require('./log');
var statisticSender = require('./statisticSender');

socket.on('connect', function cb() {
  log('connected to server ' + options.serverAddress);
});

socket.on('disconnect', function cb() {
  log('disconnected from server');
});

sensorSender(socket);
fileSender(socket, options.filesDir, options.fileSenderInterval);
photoShooter();
videoShooter();
statisticSender(socket, options.statisticsFile, options.statisticsInterval);
