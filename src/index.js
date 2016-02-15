var options = require('./camOptions');
var statisticsSender = require('./statisticsSender');
var fileSender = require('./fileSender');
var connection = require('./connection');
var photoShooter = require('./photoShooter');
var videoShooter = require('./videoShooter');
var sensorSender = require('./sensorSender');
var brain = require('./brain');

statisticsSender(options.statisticsSenderInterval, options.systemStatInterval);
fileSender(options.filesDir, options.fileSenderInterval);
connection(options.serverAddress);
photoShooter();
videoShooter();
sensorSender();
brain();

//photoShooter.on();
