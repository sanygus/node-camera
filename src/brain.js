var options = require('./camOptions');
var statisticsSender = require('./statisticsSender');
/* var fileSender = require('./fileSender');
var connection = require('./connection');
var photoShooter = require('./photoShooter');
var videoShooter = require('./videoShooter');
var sensorSender = require('./sensorSender'); */
var log = require('./log');

function getData(callback) {
  statisticsSender.getStatistics(function cbGetStatistics(err, docs) {
    if (err) { throw err; }
    callback(null, docs);
  });
}

function decide(data, callback) {
  /* if (data[0].uptime <= 32132) {
    photoShooter.setQuality(50);
    videoShooter.setFramerate(5);
  } */
  callback();
}

function brain() {
  getData(function cdGetData(err, data) {
    if (err) { throw err; }
    decide(data, function cbDecide() {
      setTimeout(brain, options.brainInterval);
    });
  });
  log('brain tick');
}

module.exports = function brainInit() {
  brain();
};
