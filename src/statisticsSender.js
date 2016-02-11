var dateformat = require('dateformat');
var async = require('async');
var exec = require('child_process');
var connection = require('./connection');
var log = require('./log');
var DataStore = require('nedb');

var db = new DataStore({ filename: '/tmp/camdb', autoload: true });

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
      exec.exec('uptime', function cbExec(err, stdout, stderr) {
        if (err) { throw err; }
        if (stderr) { throw stderr; }
        callbackAsync(null, stdout);
      });
    },
    function getPingTime(callbackAsync) {
      exec.exec('df -h /tmp', function cbExec(err, stdout, stderr) {
        if (err) { throw err; }
        if (stderr) { throw stderr; }
        callbackAsync(null, stdout);
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

module.exports = function statisticsSenderInit(interval, systemStatInterval) {
  statisticsSender(interval);
  getSystemStat(systemStatInterval);
};

module.exports.takeStat = takeStat;
