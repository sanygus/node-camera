'use strict';

const dateformat = require('dateformat');
const async = require('async');
const path = require('path');
const connection = require('./connection');
const log = require('./log');
const DataStore = require('nedb');
const os = require('os');
const diskspace = require('diskspace');
const db = require('./db');

let dbStat;

function takeStat(object) {
  const newObject = {
    date: dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
    sent: false,
  };
  let key;
  if (typeof(object) === 'object') {
    for (key in object) {
      if (object.hasOwnProperty(key)) {
        newObject[key] = object[key];
      }
    }
    dbStat.insert(newObject, (err/* , newDoc*/) => {
      if (err) { throw err; }
      log(newObject);
    });
  } else {
    log('takeStat: not object');
  }
}

function getSystemStat() {
  db.loadSettings('statisticsSettings', (errLoad, settings) => {
    if (settings.getSystemStatEnabled) {
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
        takeStat({
          uptime: results[0],
          disk: results[1],
        });
        setTimeout(getSystemStat, settings.getSystemStatInterval);
      });
    } else {
      setTimeout(getSystemStat, settings.getSystemStatInterval);
    }
  });
}

function statisticsSender() {
  db.loadSettings('statisticsSettings', (errLoad, settings) => {
    if (errLoad) { throw errLoad; }
    if (settings.enabled) {
      connection.getSocket((err, socket) => {
        if (err) { throw err; }
        if (socket.connected) {
          dbStat.findOne({ sent: false }).sort({ date: -1 }).exec((errFind, doc) => {
            if (errFind) { throw errFind; }
            if (doc) {
              socket.emit('statistics', doc, () => {
                dbStat.update({ _id: doc._id }, { $set: { sent: true } }, {}, (errUpdate) => {
                  if (errUpdate) { throw errUpdate; }
                  setImmediate(statisticsSender);
                });
              });
            } else {
              setTimeout(statisticsSender, settings.senderInterval);
            }
          });
        } else {
          setTimeout(statisticsSender, settings.senderInterval);
        }
      });
    } else {
      setTimeout(statisticsSender, settings.senderInterval);
    }
  });
}

function getStatistics(callback) {
  dbStat.find({}).sort({ date: -1 }).exec((err, docs) => {
    if (err) { throw err; }
    callback(null, docs);
  });
}

module.exports.init = function statisticsSenderInit(dbFile, dbCompactionInterval) {
  statisticsSender();
  getSystemStat();
  dbStat = new DataStore({ filename: path.resolve(dbFile), autoload: true });
  dbStat.persistence.setAutocompactionInterval(dbCompactionInterval);
};

module.exports.takeStat = takeStat;

module.exports.getStatistics = getStatistics;

module.exports.statisticsSender.on = function statisticsSenderOn() {
  db.saveSettings('statisticsSettings', 'senderEnabled', 'true');
};

module.exports.statisticsSender.off = function statisticsSenderOff() {
  db.saveSettings('statisticsSettings', 'senderEnabled', 'false');
};

module.exports.statisticsSender.setInterval = function statisticsSenderSetInterval(interval) {
  db.saveSettings('statisticsSettings', 'senderInterval', interval);
};

module.exports.sysStatCollector.on = function sysStatCollectorOn() {
  db.saveSettings('statisticsSettings', 'getSystemStatEnabled', 'true');
};

module.exports.sysStatCollector.off = function sysStatCollectorOff() {
  db.saveSettings('statisticsSettings', 'getSystemStatEnabled', 'false');
};

module.exports.sysStatCollector.setInterval = function sysStatCollectorSetInterval(interval) {
  db.saveSettings('statisticsSettings', 'getSystemStatInterval', interval);
};
