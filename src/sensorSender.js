var options = require('./camOptions');
var exec = require('child_process');
var dateformat = require('dateformat');
var fs = require('fs');
var path = require('path');
var async = require('async');

function getSensors(callback) {
  var sensorsValues = {
    date: dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
    cputemp: null,
    pingtime: null,
  };
  /* test values */
  async.parallel([
    function getTemperature(callbackAsync) {
      // opt/vc/bin/vcgencmd measure_temp
      exec.exec('echo 12345678910', function cbExec(err, stdout, stderr) {
        if (stderr) { throw stderr; }
        callbackAsync(err, stdout);
      });
    },
    function getPingTime(callbackAsync) {
      exec.exec('ping -c 1 -w 1 8.8.8.9;exit 0', function cbExec(err, stdout, stderr) {
        if (stderr) { throw stderr; }
        callbackAsync(err, stdout);
      });
    },
  ], function cbAsync(err, results) {
    if (err) { throw err; }
    sensorsValues.cputemp = results[0].substring(5, 11);
    sensorsValues.pingtime = results[1].substring(91, 98);
    if (sensorsValues.pingtime === 'nsmitte') { sensorsValues.pingtime = null; }
    callback(sensorsValues);
  });
}

function getSensorsFromFile(callback) {
  fs.exists(options.sensorsFile, function cb(exist) {
    if (exist) {
      fs.readFile(path.resolve(options.sensorsFile), 'utf8', function cbReadFile(err, data) {
        if (data !== '') {
          callback(JSON.parse(data.substring(data.lastIndexOf('{'), data.lastIndexOf('}') + 1)));
          fs.writeFile(path.resolve(options.sensorsFile), data.substring(0, data.lastIndexOf('{')));
        } else {
          callback(null);
        }
      });
    } else {
      callback(null);
    }
  });
}

function sendSensors(socket, values) {
  if (socket.connected) {
    console.log(values);
    socket.emit(options.serverSensorsEvent, values);

    getSensorsFromFile(function cb(valuesFile) {
      if (valuesFile) {
        sendSensors(socket, valuesFile);
      }
    });
  } else {
    fs.writeFile(path.resolve(options.sensorsFile), JSON.stringify(values), { flag: 'a' });
  }
}

module.exports = function sensorSender(socket) {
  setInterval(function cbInterval() {
    getSensors(function cbGetSensors(sensorsValues) {
      sendSensors(socket, sensorsValues);
    });
  }, options.sensorsInterval);
};
/* TODO: setTimeout */
