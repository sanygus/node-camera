var options = require('./camOptions');
var dateformat = require('dateformat');
var settings = options.defaultSettings.photo;
var photoEnabled = settings.enabled; // temp
var path = require('path');
var Camera = require('camerapi');
var cam = new Camera();
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

module.exports = function photoShooter() {
  setTimeout(function cb() {
    if (photoEnabled) {
      takePhoto(function cbTakePhoto() {
        photoShooter();
      });
    } else {
      photoShooter();
    }
  }, settings.interval);
};

module.exports.on = function photoOn() {
  photoEnabled = true;
};

module.exports.off = function photoOff() {
  photoEnabled = false;
};
