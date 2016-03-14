'use strict';

const options = require('./camOptions');
const DataStore = require('nedb');
const path = require('path');

let db;

module.exports.init = function dbInit() {
  db = new DataStore({ filename: path.resolve(options.systemDbFile), autoload: true });
  db.persistence.setAutocompactionInterval(options.systemDBCompactionInterval);
};

module.exports.loadCamSettings = function loadCamSettings(type, callback) {
  db.findOne({ type }, { settings: 1, _id: 0 }, (errFind, doc) => {
    if (errFind) { throw errFind; }
    if (doc) {
      callback(null, doc.settings);
    } else {
      db.insert({ type, settings: options.defaultSettings[type] }, (errInsert) => {
        if (errInsert) { throw errInsert; }
        callback(null, options.defaultSettings[type]);
      });
    }
  });
};

module.exports.saveCamSettings = function saveCamSettings(type, option, value, callback) {
  // const field = `settings.${option}`;
  db.update(
    { type },
    { $set: { field: value } }, // field
    { upsert: true },
    (errUpdate) => {
      if (errUpdate) { throw errUpdate; }
      if (callback) { callback(null); }
    }
  );
};
