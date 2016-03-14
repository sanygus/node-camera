'use strict';

const options = require('./camOptions');
const db = require('./db');
const statisticsSender = require('./statisticsSender');
const fileSender = require('./fileSender');
const connection = require('./connection');
const photoShooter = require('./photoShooter');
const videoShooter = require('./videoShooter');
const sensorSender = require('./sensorSender');
const brain = require('./brain');

db.init();
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
sensorSender.init();
brain();
