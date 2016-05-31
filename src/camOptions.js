'use strict';

module.exports = {
  serverAddress: 'http://192.168.0.122:2929',
  serverSensorsEvent: 'sensors',
  serverFilesEvent: 'file',
  sensorsFile: '/tmp/sensors',
  filesDir: '/tmp/cam',
  defaultSettings: {
    fileSenderSettings: {
      enabled: true,
      interval: 2000,
    },
    photoCamSettings: {
      enabled: false,
      width: 2592, // px
      height: 1944, // px
      quality: 100, // %
      timeout: 200, // ms
      interval: 5000, // ms
    },
    videoCamSettings: {
      enabled: false,
      width: 1280, // px
      height: 720, // px
      framerate: 15, // fps
      bitrate: 15000000, // bits/s // 1080p30 a high quality bitrate would be 15Mbits/s or more
      time: 5000, // ms
      interval: 5000, // ms
    },
    sensorsSettings: {
      enabled: true,
      interval: 4000,
    },
    statisticsSenderSettings: {
      enabled: false,
      interval: 2000,
    },
    systemStatSettings: {
      enabled: false,
      interval: 10000,
    },
  },
  logFile: './camera.log',
  brainInterval: 5000,
  RPiHostname: 'raspberrypi',
  dbFile: '/tmp/camdb', // stat
  dbCompactionInterval: 60000,
  systemDbFile: '/tmp/camsystemdb', // settings
  systemDBCompactionInterval: 120000,
};
