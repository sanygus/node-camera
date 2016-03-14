'use strict';

const db = require('./db');
const options = require('./camOptions');
const dateformat = require('dateformat');
const path = require('path');
const Camera = require('camerapi');
const cam = new Camera();

cam.baseFolder(path.resolve(options.filesDir));

function takeVideo(settings, callback) {
  cam
    .nopreview()
    .width(settings.width)
    .height(settings.height)
    .framerate(settings.framerate)
    // .bitrate(settings.bitrate)//bits/s//1080p30 15Mbits/s or more
    .timeout(settings.time)
    .recordVideo(
      `${dateformat(new Date(), 'yyyy-mm-dd\'T\'HH:MM:ss')} .h264`,
      () => {
        callback();
      }
    );
}

function videoShooter() {
  db.loadCamSettings('videoCamSettings', (errLoad, settings) => {
    if (errLoad) { throw errLoad; }
    setTimeout(() => {
      if (settings.enabled) {
        takeVideo(() => {
          videoShooter();
        });
      } else {
        videoShooter();
      }
    }, settings.interval);
  });
}

module.exports.init = function videoShooterInit() {
  videoShooter();
};

module.exports.on = function videoOn() {
  db.saveCamSettings('videoCamSettings', 'enabled', 'true');
};

module.exports.off = function videoOff() {
  db.saveCamSettings('videoCamSettings', 'enabled', 'false');
};

module.exports.setResolution = function setResolution(width, height) {
  db.saveCamSettings('videoCamSettings', 'width', width);
  db.saveCamSettings('videoCamSettings', 'height', height);
};

module.exports.setFramerate = function setFramerate(fps) {
  db.saveCamSettings('videoCamSettings', 'framerate', fps);
};

module.exports.setBitrate = function setBitrate(bitrate) {
  db.saveCamSettings('videoCamSettings', 'bitrate', bitrate);
};

module.exports.setTime = function setTime(time) {
  db.saveCamSettings('videoCamSettings', 'time', time);
};

module.exports.setInterval = function setInterval(interval) {
  db.saveCamSettings('videoCamSettings', 'interval', interval);
};
