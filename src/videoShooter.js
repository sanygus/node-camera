var options = require('./camOptions');
var settings = options.defaultSettings.video;
var videoEnabled = settings.enabled; // temp
var dateformat = require('dateformat');
var path = require('path');
var Camera = require('camerapi');
var cam = new Camera();
cam.baseFolder(path.resolve(options.filesDir));

function takeVideo(callback) {
  cam
    .nopreview()
    .width(settings.width)
    .height(settings.height)
    .framerate(settings.framerate)
    // .bitrate(settings.bitrate)//bits/s//1080p30 15Mbits/s or more
    .timeout(settings.time)
    .recordVideo(
      dateformat(new Date(), 'yyyy-mm-dd\'T\'HH:MM:ss') + '.h264',
      function cbTakeVideo() {
        callback();
      }
    );
}

function videoShooter() {
  setTimeout(function cb() {
    if (videoEnabled) {
      takeVideo(function cbTakeVideo() {
        videoShooter();
      });
    } else {
      videoShooter();
    }
  }, settings.interval);
}

module.exports = function videoShooterInit() {
  videoShooter();
};

module.exports.on = function photoOn() {
  videoEnabled = true;
};

module.exports.off = function photoOff() {
  videoEnabled = false;
};
