var options = require('./camOptions');
var DataStore = require('nedb');
var path = require('path');

var db;

module.exports.init = function systemInit() {
  db = new DataStore({ filename: path.resolve(options.systemDbFile), autoload: true });
  db.persistence.setAutocompactionInterval(options.systemDBCompactionInterval);
};

module.exports.loadCamSettings = function loadCamSettings(type, callback) {
  var typeForDB;
  if (type === 'photo') {                   // TEMPORARY
    typeForDB = 'photoCamSettings';         //
  } else if (type === 'video') {            //
    typeForDB = 'videoCamSettings';         //
  } else {                                  //
    throw new Error('wrong type settings'); //
  }                                         //
  db.findOne({ type: typeForDB }, { settings: 1, _id: 0 }, function cbFind(errFind, doc) {
    if (errFind) { throw errFind; }
    if (doc) {
      callback(null, doc.settings);
    } else {
      callback(null, options.defaultSettings[type]);
    }
  });
};

module.exports.saveCamSettings = function saveCamSettings(type, settings) {
  var typeForDB;
  if (type === 'photo') {                   // TEMPORARY
    typeForDB = 'photoCamSettings';         //
  } else if (type === 'video') {            //
    typeForDB = 'videoCamSettings';         //
  } else {                                  //
    throw new Error('wrong type settings'); //
  }                                         //
  db.count({ type: typeForDB }, function cbCount(err, count) {
    if (count === 0) {
      db.insert({ type: typeForDB, settings: settings }, function cbInsert(errInsert) {
        if (errInsert) { throw errInsert; }
      });
    } else {
      db.update(
        { type: typeForDB },
        { $set: { settings: settings } },
        {},
        function cbUpdate(errUpdate) {
          if (errUpdate) { throw errUpdate; }
        }
      );
    }
  });
};
