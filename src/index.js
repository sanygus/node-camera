var system = require('./system');
var options = require('./camOptions');
var statisticsSender = require('./statisticsSender');
var fileSender = require('./fileSender');
var connection = require('./connection');
var photoShooter = require('./photoShooter');
var videoShooter = require('./videoShooter');
var sensorSender = require('./sensorSender');
var brain = require('./brain');

system.init();
statisticsSender.init(
  options.statisticsSenderInterval,
  options.systemStatInterval,
  options.dbFile,
  options.dbCompactionInterval
);
fileSender(options.filesDir, options.fileSenderInterval);
connection.init(options.serverAddress);
photoShooter.init();
videoShooter.init();
sensorSender();
brain();
