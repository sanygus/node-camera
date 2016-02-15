var options = require('./camOptions');
/* var statisticsSender = require('./statisticsSender');
var fileSender = require('./fileSender');
var connection = require('./connection');
var photoShooter = require('./photoShooter');
var videoShooter = require('./videoShooter');
var sensorSender = require('./sensorSender'); */
var log = require('./log');

function getData(callback) {
  callback(null, null);
}

function brain() {
  getData(function cdGetData(err/* , data*/) {
    if (err) { throw err; }
    /* if (fileSender.queue() > 64) {
      photoShooter.off();
    }
    */
    // photoShooter.on();
    setTimeout(brain, options.brainInterval);
  });
  log('brain tick');
}

module.exports = function brainInit() {
  brain();
};
