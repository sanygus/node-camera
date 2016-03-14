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
  db.loadCamSettings('photoCamSettings', (errLoad, settings) => {
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
  db.saveCamSettings('photoCamSettings', 'enabled', 'true');
};

module.exports.off = function photoOff() {
  db.saveCamSettings('photoCamSettings', 'enabled', 'false');
};

module.exports.setTimeout = function setTimeout(timeout) {
  db.saveCamSettings('photoCamSettings', 'timeout', timeout);
};

module.exports.setResolution = function setResolution(width, height) {
  db.saveCamSettings('photoCamSettings', 'width', width);
  db.saveCamSettings('photoCamSettings', 'height', height);
};

module.exports.setQuality = function setQuality(quality) {
  db.saveCamSettings('photoCamSettings', 'quality', quality);
};

module.exports.setInterval = function setInterval(interval) {
  db.saveCamSettings('photoCamSettings', 'interval', interval);
};
