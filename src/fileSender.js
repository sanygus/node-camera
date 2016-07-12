const db = require('./db');
const fs = require('fs');
const path = require('path');
const statisticsSender = require('./statisticsSender');
const connection = require('./connection');
const log = require('./log');

function getFileToSend(dirPath, callback) {
  fs.exists(path.resolve(dirPath), (exists) => {
    if (exists) {
      fs.readdir(path.resolve(dirPath), (err, files) => {
        let filesDir;
        if (err) { throw err; }
        filesDir = files.slice().filter((fileName) => {
          return /.+\.(jpg|h264)$/.test(fileName);
        }).sort().reverse();
        if (filesDir.length > 0) {
          callback(null, path.resolve(dirPath, filesDir[0]));
        } else {
          callback(null, null);
        }
      });
    } else {
      log('cam dir not exist');
      callback(null, null);
    }
  });
}

function sendFile(socket, filePath, callback) {
  let startTime;
  if (socket.connected) {
    fs.readFile(filePath, (err, data) => {
      if (err) { throw err; }
      log(`sending ${filePath}`);
      startTime = new Date();
      socket.emit(
        'file',
        { filename: path.basename(filePath), content: data },
        () => {
          callback(null, true);
          statisticsSender.takeStat({
            size: data.length,
            time: new Date() - startTime,
          });
        }
      );
    });
  } else {
    callback(null, false);
  }
}

function trySendNewestFile(dirPath, callback) {
  getFileToSend(dirPath, (err, filePath) => {
    if (err) { throw err; }
    if (filePath) {
      connection.getSocket((errGetSocket, socket) => {
        if (errGetSocket) { throw errGetSocket; }
        sendFile(socket, filePath, (errSendFile, sent) => {
          if (errSendFile) { throw errSendFile; }
          if (sent) {
            fs.unlink(filePath, () => {
              callback(null, true);
            });
          } else {
            callback(null, false);
          }
        });
      });
    } else {
      callback(null, false);
    }
  });
}

function fileSender(dirPath) {
  function runAgain() {
    fileSender(dirPath);
  }
  db.loadSettings('fileSenderSettings', (errLoad, settings) => {
    if (errLoad) { throw errLoad; }
    if (settings.enabled) {
      trySendNewestFile(dirPath, (err, sent) => {
        if (err) { throw err; }
        if (sent) {
          setImmediate(runAgain);
        } else {
          setTimeout(runAgain, settings.interval);
        }
      });
    } else {
      setTimeout(runAgain, settings.interval);
    }
  });
}

module.exports.init = function startFileSender(dirPath) {
  fileSender(dirPath);
};

module.exports.on = function fileSenderOn() {
  db.saveSettings('fileSenderSettings', 'enabled', true);
};

module.exports.off = function fileSenderOff() {
  db.saveSettings('fileSenderSettings', 'enabled', false);
};

module.exports.setInterval = function fileSenderSetInterval(interval) {
  db.saveSettings('fileSenderSettings', 'interval', interval);
};
