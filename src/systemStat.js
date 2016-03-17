'use strict';

const async = require('async');
const os = require('os');
const diskspace = require('diskspace');
const db = require('./db');
const statisticsSender = require('./statisticsSender');

function getSystemStat() {
  db.loadSettings('systemStatSettings', (errLoad, settings) => {
    if (settings.enabled) {
      async.parallel([
        function getUptime(callbackAsync) {
          callbackAsync(null, os.uptime());
        },
        function getDiskSpace(callbackAsync) {
          let drive;
          switch (os.type()) {
            case 'Linux':
              drive = '/tmp';
              break;
            case 'Windows_NT':
              drive = 'C';
              break;
            default:
              drive = '';
              break;
          }
          diskspace.check(drive, (err, total, free, status) => {
            if (err) { throw err; }
            if (status !== 'READY') {
              throw new Error('disk error');
            }
            callbackAsync(null, free);
          });
        },
      ], (err, results) => {
        if (err) { throw err; }
        statisticsSender.takeStat({
          uptime: results[0],
          disk: results[1],
        });
        setTimeout(getSystemStat, settings.interval);
      });
    } else {
      setTimeout(getSystemStat, settings.interval);
    }
  });
}

module.exports.init = function systemStatInit() {
  getSystemStat();
};

module.exports.on = function systemStatOn() {
  db.saveSettings('systemStatSettings', 'enabled', true);
};

module.exports.off = function systemStatOff() {
  db.saveSettings('systemStatSettings', 'enabled', false);
};

module.exports.setInterval = function systemStatSetInterval(interval) {
  db.saveSettings('systemStatSettings', 'interval', interval);
};
