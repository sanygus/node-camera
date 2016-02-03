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
      var temperature;
      // opt/vc/bin/vcgencmd measure_temp
      exec.exec('echo 12345678910', function cbExec(err, stdout, stderr) {
        if (err) { throw err; }
        if (stderr) { throw stderr; }
        temperature = stdout.substring(5, 11);
        callbackAsync(null, temperature);
      });
    },
    function getPingTime(callbackAsync) {
      var pingTime;
      exec.exec('ping -c 1 -w 1 8.8.8.9;exit 0', function cbExec(err, stdout, stderr) {
        if (err) { throw err; }
        if (stderr) { throw stderr; }
        pingTime = stdout.substring(91, 98);
        if (pingTime === 'nsmitte') { pingTime = null; }
        callbackAsync(null, pingTime);
      });
    },
  ], function cbAsync(err, results) {
    if (err) { throw err; }
    sensorsValues.cputemp = results[0];
    sensorsValues.pingtime = results[1];
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
