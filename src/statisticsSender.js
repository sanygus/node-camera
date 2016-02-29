var dateformat = require('dateformat');
var async = require('async');
var path = require('path');
var connection = require('./connection');
var log = require('./log');
var DataStore = require('nedb');
var os = require('os');
var diskspace = require('diskspace');

var db;

function takeStat(object) {
  var newObject = {
    date: dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
    sent: false,
  };
  var key;
  if (typeof(object) === 'object') {
    for (key in object) {
      if (object.hasOwnProperty(key)) {
        newObject[key] = object[key];
      }
    }
    db.insert(newObject, function cbInsert(err/* , newDoc*/) {
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
      var drive;
      switch (os.type()) {
        case 'Linux':
          drive = '/tmp';
          break;
        case 'Windows':
          drive = 'C';
          break;
        default:
          drive = '';
          break;
      }
      diskspace.check(drive, function cdCheck(err, total, free, status) {
        if (err) { throw err; }
        if (status !== 'READY') {
          throw new Error('disk error');
        }
        callbackAsync(null, free);
      });
    },
  ], function cbAsync(err, results) {
    if (err) { throw err; }
    takeStat({
      uptime: results[0],
      disk: results[1],
    });
    setTimeout(function funcTimeout() {
      getSystemStat(interval);
    }, interval);
  });
}

function statisticsSender(interval) {
  function runAgain() {
    statisticsSender(interval);
  }

  connection.getSocket(function cdGetSocket(err, socket) {
    if (err) { throw err; }
    if (socket.connected) {
      db.findOne({ sent: false }).sort({ date: -1 }).exec(function cbFind(errFind, doc) {
        if (errFind) { throw errFind; }
        if (doc) {
          socket.emit('statistics', doc, function cbEmit() {
            db.update({ _id: doc._id }, { $set: { sent: true } }, {}, function cbUpdate(errUpdate) {
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
  db.find({}).sort({ date: -1 }).exec(function cbFind(err, docs) {
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
