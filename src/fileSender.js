var fs = require('fs');
var path = require('path');
var log = require('./log');
var statisticsWriter = require('./statisticsWriter');

function getFileToSend(dirPath, callback) {
  fs.readdir(path.resolve(dirPath), function cbReadDir(err, files) {
    var filesDir;
    if (err) { throw err; }
    filesDir = files.slice().filter(function filesFilter(fileName) {
      return /.*\.(jpg|h264)$/.test(fileName);
    }).sort().reverse();
    if (filesDir.length > 0) {
      callback(null, path.resolve(dirPath, filesDir[0]));
    } else {
      callback(null, null);
    }
  });
}

function sendFile(socket, filePath, callback) {
  var startTime;
  if (socket.connected) {
    fs.readFile(filePath, function cb(err, data) {
      if (err) { throw err; }
      log('sending ' + filePath);
      startTime = new Date();
      socket.emit(
        'file',
        { filename: path.basename(filePath), content: data },
        function cbEmit() {
          callback(null, true);
          statisticsWriter({
            size: data.length,
            time: (new Date() - startTime),
          }); // допилить
        }
      );
    });
  } else {
    callback(null, false);
  }
}

function trySendNewestFile(socket, dirPath, callback) {
  getFileToSend(dirPath, function cb(err, filePath) {
    if (err) { throw err; }
    if (filePath) {
      sendFile(socket, filePath, function cbSendFile(errSendFile, sent) {
        if (errSendFile) { throw errSendFile; }
        if (sent) {
          fs.unlink(filePath, function cbUnlink() {
            callback(null, true);
          });
        } else {
          callback(null, false);
        }
      });
    } else {
      callback(null, false);
    }
  });
}

function fileSender(socket, dirPath, interval) {
  function runAgain() {
    fileSender(socket, dirPath, interval);
  }

  trySendNewestFile(socket, dirPath, function cb(err, sent) {
    if (err) { throw err; }
    if (sent) {
      setImmediate(runAgain);
    } else {
      setTimeout(runAgain, interval);
    }
  });
}

module.exports = function startFileSender(socket, dirPath, interval) {
  fileSender(socket, dirPath, interval);
};
