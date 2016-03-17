'use strict';

const dateformat = require('dateformat');
const path = require('path');
const connection = require('./connection');
const log = require('./log');
const DataStore = require('nedb');
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

function getStatistics(callback) {
  dbStat.find({}).sort({ date: -1 }).exec((err, docs) => {
    if (err) { throw err; }
    callback(null, docs);
  });
}

function statisticsSender() {
  db.loadSettings('statisticsSenderSettings', (errLoad, settings) => {
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
              setTimeout(statisticsSender, settings.interval);
            }
          });
        } else {
          setTimeout(statisticsSender, settings.interval);
        }
      });
    } else {
      setTimeout(statisticsSender, settings.interval);
    }
  });
}

module.exports.init = function statisticsSenderInit(dbFile, dbCompactionInterval) {
  dbStat = new DataStore({ filename: path.resolve(dbFile), autoload: true });
  dbStat.persistence.setAutocompactionInterval(dbCompactionInterval);
  statisticsSender();
};

module.exports.takeStat = takeStat;

module.exports.getStatistics = getStatistics;

module.exports.on = function statisticsSenderOn() {
  db.saveSettings('statisticsSenderSettings', 'enabled', 'true');
};

module.exports.off = function statisticsSenderOff() {
  db.saveSettings('statisticsSenderSettings', 'enabled', 'false');
};

module.exports.setInterval = function statisticsSenderSetInterval(interval) {
  db.saveSettings('statisticsSenderSettings', 'interval', interval);
};
