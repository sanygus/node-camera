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

const brain = require('./brain');

function getSensors(callback) {
  const sensorsValues = {
    date: dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
    cputemp: null,
    voltage: null,
    voltageBat: null,
    capacity: null,
    amperage: null,
    power: null,
    ost: null,
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
        temperature = Math.round(Math.random() * 10); // test values
        callbackAsync(null, temperature);
      }
    },
    /*function getPingTime(callbackAsync) {
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
    },*/
    (callbackAsync) => {
      fs.readFile(path.resolve("/tmp/voltage"), 'utf8', (err, data) => {
        if (data !== '') {
          callbackAsync(null, data.replace('\n', ''))
        }
      });
    },
    (callbackAsync) => {
      fs.readFile(path.resolve("/tmp/amperage"), 'utf8', (err, data) => {
        if (data !== '') {
          callbackAsync(null, data.replace('\n', ''))
        }
      });
    },
  ], (err, results) => {
    if (err) { throw err; }
    sensorsValues.cputemp = Number(results[0] * 1);//'C
    sensorsValues.voltage = 5;//В Power
    sensorsValues.voltageBat = Number((results[1] * 1).toFixed(3));//В
    sensorsValues.capacity = Number(((sensorsValues.voltageBat - 9.5) * 0.2 * 40).toFixed(3));//Ач
    if (sensorsValues.capacity < 0) { sensorsValues.capacity = 0; }
    sensorsValues.amperage = Number((results[2] * 1).toFixed(3));//А
    sensorsValues.power = Number((sensorsValues.voltage * sensorsValues.amperage).toFixed(3));//Вт
    sensorsValues.ost = Number(((sensorsValues.capacity / sensorsValues.amperage) * 60 * 60).toFixed(1));//сек
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
    //log(values);
    socket.emit(options.serverSensorsEvent, values, (settings) => {
      console.log('given settings');
      console.log(settings);
      brain.modeReceiver(settings.mode);
      brain.RTVReceiver(settings.RTV);
    });

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
