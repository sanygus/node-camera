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
  var newObject = {};
  var key;
  if (typeof(object) === 'object') {
    newObject.date = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss');
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
    log('not object');
  }
}

function getSystemStat(interval) {
  async.parallel([
    function getUptime(callbackAsync) {
      callbackAsync(null, os.uptime());
    },
    function getPingTime(callbackAsync) {
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
      db.findOne({}).sort({ date: -1 }).exec(function cbFind(errFind, doc) {
        if (errFind) { throw errFind; }
        if (doc) {
          socket.emit('statistics', doc, function cbEmit() {
            db.remove({ _id: doc._id }, {}, function cbRemove(errRemove/* , numRemoved*/) {
              if (errRemove) { throw errRemove; }
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

module.exports = function statisticsSenderInit(interval, systemStatInterval, dbFile) {
  statisticsSender(interval);
  getSystemStat(systemStatInterval);
  db = new DataStore({ filename: path.resolve(dbFile), autoload: true });
};

module.exports.takeStat = takeStat;
