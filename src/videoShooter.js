var system = require('./system');
var options = require('./camOptions');
var dateformat = require('dateformat');
var path = require('path');
var Camera = require('camerapi');
var cam = new Camera();

var settings = {};

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
    if (settings.enabled) {
      takeVideo(function cbTakeVideo() {
        videoShooter();
      });
    } else {
      videoShooter();
    }
  }, settings.interval);
}

function saveSettings() {
  system.saveCamSettings('video', settings);
}

module.exports.init = function videoShooterInit() {
  system.loadCamSettings(function cbLoad(err, loadedSettings) {
    if (err) { throw err; }
    settings = loadedSettings.video;
    videoShooter();
  });
};

module.exports.on = function videoOn() {
  settings.enabled = true;
  saveSettings();
};

module.exports.off = function videoOff() {
  settings.enabled = false;
  saveSettings();
};

module.exports.setResolution = function setResolution(width, height) {
  settings.width = width;
  settings.height = height;
  saveSettings();
};

module.exports.setFramerate = function setFramerate(fps) {
  settings.framerate = fps;
  saveSettings();
};

module.exports.setBitrate = function setBitrate(bitrate) {
  settings.bitrate = bitrate;
  saveSettings();
};

module.exports.setTime = function setTime(time) {
  settings.time = time;
  saveSettings();
};

module.exports.setInterval = function setInterval(interval) {
  settings.interval = interval;
  saveSettings();
};
