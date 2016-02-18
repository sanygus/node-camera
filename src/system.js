var options = require('./camOptions');

module.exports.init = function systemInit() {
  // something
};

module.exports.loadCamSettings = function loadCamSettings(callback) {
  // load from DB
  callback(null, options.defaultSettings);
};

module.exports.saveCamSettings = function saveCamSettings(type, settings) {
  // save to DB
  console.log(type, settings);
};
