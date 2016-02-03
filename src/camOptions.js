module.exports = {
  serverAddress: 'http://192.168.0.122:2929',
  serverSensorsEvent: 'sensors',
  serverFilesEvent: 'file',
  sensorsFile: '/tmp/sensors',
  filesDir: '/tmp/cam',
  sensorsInterval: 3000,
  fileSenderInterval: 2000,
  defaultSettings: {
    photo: {
      enabled: true,
      width: 2592, // px
      height: 1944, // px
      quality: 100, // %
      timeout: 200, // ms
      interval: 5000, // ms
    },
    video: {
      enabled: false,
      width: 1280, // px
      height: 720, // px
      framerate: 15, // fps
      bitrate: 15000000, // bits/s // 1080p30 a high quality bitrate would be 15Mbits/s or more
      time: 5000, // ms
      interval: 5000, // ms
    },
  },
};
