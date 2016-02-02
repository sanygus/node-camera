var options = require('./camOptions');
var dateformat = require('dateformat');
var settings = options.defaultSettings.photo;
var path = require('path');
var Camera = require('camerapi');
var cam = new Camera();
cam.baseDirectory(path.resolve(options.filesDir));

function takePhoto(callback) {
  if (settings.enabled) {
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
  } else {
    callback();
  }
}

module.exports = function photoShooter() {
  setTimeout(function cb() {
    takePhoto(function cbTakePhoto() {
      photoShooter();
    });
  }, settings.interval);
};
