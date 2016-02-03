var options = require('./camOptions');
var settings = options.defaultSettings.video;
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

module.exports = function videoShooter() {
  setTimeout(function cb() {
    if (settings.enabled) {
      takeVideo(function cbTakeVideo() {
        videoShooter();
      });
    } else {
      videoShooter();
    }
  }, settings.interval);
};