'use strict';

const db = require('./db');
const options = require('./camOptions');
const dateformat = require('dateformat');
const path = require('path');
const Camera = require('camerapi');
const cam = new Camera();

cam.baseFolder(path.resolve(options.filesDir));

function takePhoto(settings, callback) {
  cam.prepare({
    timeout: settings.timeout,
    width: settings.width,
    height: settings.height,
    quality: settings.quality,
  }).takePicture(
    `${dateformat(new Date(), 'yyyy-mm-dd\'T\'HH:MM:ss')} .jpg`,
    () => {
      callback();
    }
  );
}

function photoShooter() {
  db.loadSettings('photoCamSettings', (errLoad, settings) => {
    if (errLoad) { throw errLoad; }
    setTimeout(() => {
      if (settings.enabled) {
        takePhoto(settings, () => {
          photoShooter();
        });
      } else {
        photoShooter();
      }
    }, settings.interval);
  });
}

module.exports.init = function photoShooterInit() {
  photoShooter();
};

module.exports.on = function photoOn() {
  db.saveSettings('photoCamSettings', 'enabled', true);
};

module.exports.off = function photoOff() {
  db.saveSettings('photoCamSettings', 'enabled', false);
};

module.exports.setTimeout = function setTimeout(timeout) {
  db.saveSettings('photoCamSettings', 'timeout', timeout);
};

module.exports.setResolution = function setResolution(width, height) {
  db.saveSettings('photoCamSettings', 'width', width);
  db.saveSettings('photoCamSettings', 'height', height);
};

module.exports.setQuality = function setQuality(quality) {
  db.saveSettings('photoCamSettings', 'quality', quality);
};

module.exports.setInterval = function setInterval(interval) {
  db.saveSettings('photoCamSettings', 'interval', interval);
};
