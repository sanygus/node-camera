var fs = require('fs');
var path = require('path');

function sendStat(socket, object, callback) {
  if (socket.connected) {
    socket.emit('statistics', object, function cbEmit() {
      callback(null, true);
    });
  } else {
    callback(null, false);
  }
}

function getStatFromFile(statFile, callback) {
  fs.exists(path.resolve(statFile), function cbExist(exist) {
    if (exist) {
      fs.readFile(path.resolve(statFile), function cbReadFile(err, data) {
        if (err) { throw err; }
        if (data !== '') {
          callback(null, JSON.parse());// end
        } else {
          callback(null, false);
        }
      });
    } else {
      callback(null, false);
    }
  });
}

function deleteObjectFromFile(file, object, callback) {
  var newdata;
  var objectString = JSON.stringify(object);
  fs.readFile(path.resolve(file), function cbReadFile(err, data) {
    newdata = data.substring(0, data.indexOf(objectString));
    if (data.length > newdata.length + objectString.length) {
      newdata += data.substring(newdata.length + objectString.length);
    }
    fs.writeFile(path.resolve(file), newdata, function cbWriteFile(errWriteFile) {
      callback(errWriteFile);
      console.log('object deleted');
    });
  });
}

function statisticsSender(socket, statFile, interval) {
  function runAgain() {
    statisticsSender(socket, statFile, interval);
  }

  getStatFromFile(statFile, function cbGetStatFromFile(err, object) {
    if (err) { throw err; }
    if (object) {
      sendStat(socket, object, function cbSendFile(errSendFile, sent) {
        if (errSendFile) { throw errSendFile; }
        if (sent) {
          deleteObjectFromFile(statFile, object, function cbDelObj(errDelObj) {
            if (errDelObj) { throw errDelObj; }
            setImmediate(runAgain);
          });
        } else {
          setTimeout(runAgain, interval);
        }
      });
    } else {
      setTimeout(runAgain, interval);
    }
  });
}

module.exports = function statisticsSenderInit(socket, statFile, interval) {
  statisticsSender(socket, statFile, interval);
};
