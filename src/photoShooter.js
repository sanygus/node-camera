var system = require('./system');
var options = require('./camOptions');
var dateformat = require('dateformat');
var path = require('path');
var Camera = require('camerapi');
var cam = new Camera();

var settings = {};

cam.baseFolder(path.resolve(options.filesDir));

function takePhoto(callback) {
  cam.prepare({
    timeout: settings.timeout,
    width: settings.width,
    height: settings.height,
    quality: settings.quality,
  }).takePicture(
    dateformat(new Date(), 'yyyy-mm-dd\'T\'HH:MM:ss') + '.jpg',
    function cbTakePicture() {
      callback();
    }
  );
}

function photoShooter() {
  setTimeout(function cb() {
    if (settings.enabled) {
      takePhoto(function cbTakePhoto() {
        photoShooter();
      });
    } else {
      photoShooter();
    }
  }, settings.interval);
}

function saveSettings() {
  system.saveCamSettings('photo', settings);
}

module.exports.init = function photoShooterInit() {
  system.loadCamSettings(function cbLoad(err, loadedSettings) {
    if (err) { throw err; }
    settings = loadedSettings.photo;
    photoShooter();
  });
};

module.exports.on = function photoOn() {
  settings.enabled = true;
  saveSettings();
};

module.exports.off = function photoOff() {
  settings.enabled = false;
  saveSettings();
};

module.exports.setTimeout = function setTimeout(timeout) {
  settings.timeout = timeout;
  saveSettings();
};

module.exports.setResolution = function setResolution(width, height) {
  settings.width = width;
  settings.height = height;
  saveSettings();
};

module.exports.setQuality = function setQuality(quality) {
  settings.quality = quality;
  saveSettings();
};

module.exports.setInterval = function setInterval(interval) {
  settings.interval = interval;
  saveSettings();
};
