module.exports = {
  serverAddress: 'http://192.168.0.122:2929',
  serverSensorsEvent: 'sensors',
  serverFilesEvent: 'file',
  sensorsFile: '/tmp/sensors',
  filesDir: '/tmpvid/cam',
  defaultSettings: {
    fileSenderSettings: {
      enabled: true,
      interval: 5000,
    },
    photoCamSettings: {
      enabled: false,
      width: 1920, // px
      height: 1080, // px
      quality: 10, // %
      timeout: 200, // ms
      interval: 15000, // ms
    },
    videoCamSettings: {
      enabled: false,
      width: 1280, // px
      height: 720, // px
      framerate: 10, // fps
      bitrate: 1500000, // bits/s // 1080p30 a high quality bitrate would be 15Mbits/s or more
      time: 10000, // ms
      interval: 20000, // ms
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
  brainInterval: 1000,
  RPiHostname: 'raspberrypi',
  dbFile: '/tmp/camdb', // stat
  dbCompactionInterval: 60000,
  systemDbFile: '/tmp/camsystemdb', // settings
  systemDBCompactionInterval: 120000,
};
