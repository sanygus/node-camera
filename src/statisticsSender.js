'use strict';

const dateformat = require('dateformat');
const async = require('async');
const path = require('path');
const connection = require('./connection');
const log = require('./log');
const DataStore = require('nedb');
const os = require('os');
const diskspace = require('diskspace');

let db;

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
    db.insert(newObject, (err/* , newDoc*/) => {
      if (err) { throw err; }
      log(newObject);
    });
  } else {
    log('takeStat: not object');
  }
}

function getSystemStat(interval) {
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
    setTimeout(() => {
      getSystemStat(interval);
    }, interval);
  });
}

function statisticsSender(interval) {
  function runAgain() {
    statisticsSender(interval);
  }

  connection.getSocket((err, socket) => {
    if (err) { throw err; }
    if (socket.connected) {
      db.findOne({ sent: false }).sort({ date: -1 }).exec((errFind, doc) => {
        if (errFind) { throw errFind; }
        if (doc) {
          socket.emit('statistics', doc, () => {
            db.update({ _id: doc._id }, { $set: { sent: true } }, {}, (errUpdate) => {
              if (errUpdate) { throw errUpdate; }
              runAgain();
            });
          });
        } else {
          setTimeout(runAgain, interval);
        }
      });
    } else {
      setTimeout(runAgain, interval);
    }
  });
}

function getStatistics(callback) {
  db.find({}).sort({ date: -1 }).exec((err, docs) => {
    if (err) { throw err; }
    callback(null, docs);
  });
}

module.exports.init = function statisticsSenderInit(
  interval,
  systemStatInterval,
  dbFile,
  dbCompactionInterval
) {
  statisticsSender(interval);
  getSystemStat(systemStatInterval);
  db = new DataStore({ filename: path.resolve(dbFile), autoload: true });
  db.persistence.setAutocompactionInterval(dbCompactionInterval);
};

module.exports.takeStat = takeStat;

module.exports.getStatistics = getStatistics;
