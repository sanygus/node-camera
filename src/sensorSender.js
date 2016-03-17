'use strict';

const db = require('./db');
const options = require('./camOptions');
const connection = require('./connection');
const exec = require('child_process');
const dateformat = require('dateformat');
const fs = require('fs');
const path = require('path');
const async = require('async');
const log = require('./log');
const os = require('os');

function getSensors(callback) {
  const sensorsValues = {
    date: dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
    cputemp: null,
    pingtime: null,
  };
  /* test values */
  async.parallel([
    function getTemperature(callbackAsync) {
      let temperature = null;
      if (os.hostname() === options.RPiHostname) {
        exec.exec('/opt/vc/bin/vcgencmd measure_temp', (err, stdout, stderr) => {
          if (err) { throw err; }
          if (stderr) { throw stderr; }
          temperature = stdout.substring(5, 7);
          callbackAsync(null, temperature);
        });
      } else {
        callbackAsync(null, temperature);
      }
    },
    function getPingTime(callbackAsync) {
      let pingTime = null;
      if (os.type() === 'Linux') {
        exec.exec('ping -c 1 -w 1 8.8.8.8;exit 0', (err, stdout, stderr) => {
          if (err) { throw err; }
          if (stderr) { throw stderr; }
          pingTime = /time=(.+) ms/.exec(stdout);
          if (pingTime) { pingTime = parseFloat(pingTime[1]); }
          callbackAsync(null, pingTime);
        });
      } else {
        callbackAsync(null, pingTime);
      }
    },
  ], (err, results) => {
    if (err) { throw err; }
    sensorsValues.cputemp = results[0];
    sensorsValues.pingtime = results[1];
    callback(sensorsValues);
  });
}

function getSensorsFromFile(callback) {
  fs.exists(path.resolve(options.sensorsFile), (exist) => {
    if (exist) {
      fs.readFile(path.resolve(options.sensorsFile), 'utf8', (err, data) => {
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
    log(values);
    socket.emit(options.serverSensorsEvent, values);

    getSensorsFromFile((valuesFile) => {
      if (valuesFile) {
        sendSensors(socket, valuesFile);
      }
    });
  } else {
    fs.writeFile(path.resolve(options.sensorsFile), JSON.stringify(values), { flag: 'a' });
  }
}

function sensorSender() {
  db.loadSettings('sensorsSettings', (errLoad, settings) => {
    if (errLoad) { throw errLoad; }
    setTimeout(() => {
      if (settings.enabled) {
        getSensors((sensorsValues) => {
          connection.getSocket((err, socket) => {
            if (err) { throw err; }
            sendSensors(socket, sensorsValues);
            sensorSender();
          });
        });
      } else {
        sensorSender();
      }
    }, settings.interval);
  });
}

module.exports.init = function sensorSenderInit() {
  sensorSender();
};

module.exports.on = function sensorsOn() {
  db.saveSettings('sensorsSettings', 'enabled', true);
};

module.exports.off = function sensorsOff() {
  db.saveSettings('sensorsSettings', 'enabled', false);
};

module.exports.setInterval = function setInterval(interval) {
  db.saveSettings('sensorsSettings', 'interval', interval);
};
