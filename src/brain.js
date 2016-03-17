'use strict';

const options = require('./camOptions');
const statisticsSender = require('./statisticsSender');
/* const systemStat = require('./systemStat');
const fileSender = require('./fileSender');
const connection = require('./connection');
const photoShooter = require('./photoShooter');
const videoShooter = require('./videoShooter');
const sensorSender = require('./sensorSender'); */
const log = require('./log');

function getData(callback) {
  statisticsSender.getStatistics((err, docs) => {
    if (err) { throw err; }
    callback(null, docs);
  });
}

function decide(data, callback) {
  /* if (data[0].uptime <= 32132) {
    photoShooter.setQuality(50);
    videoShooter.setFramerate(5);
  }
  sensorSender.setInterval(1000);
  sensorSender.off(); */
  callback();
}

function brain() {
  getData((err, data) => {
    if (err) { throw err; }
    decide(data, () => {
      setTimeout(brain, options.brainInterval);
    });
  });
  log('brain tick');
}

module.exports = function brainInit() {
  brain();
};
