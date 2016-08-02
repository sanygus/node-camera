const exec = require('child_process').exec;
const options = require('./camOptions');
const statisticsSender = require('./statisticsSender');
const fs = require('fs');
const path = require('path');
//const systemStat = require('./systemStat');
const fileSender = require('./fileSender');
//const connection = require('./connection');
const photoShooter = require('./photoShooter');
const videoShooter = require('./videoShooter');
//const sensorSender = require('./sensorSender');
const log = require('./log');

let currentMode = [];
let actions = [];
let timer;
let RTV = false;

function cloneMode(inputArray) {
  let outArray = [];
  inputArray.forEach((mode) => {
    outArray.push({ type: mode.type, duration: mode.duration });
  });
  return outArray;
}
/*
module.exports.getModeAmp = function getModeAmp(callback) {
  let sumT = 0;
  let sumPhoto = 0;
  let sumVideo = 0;
  let sumSleep = 0;
  let sumNothing = 0;
  currentMode.forEach((mode) => {
    sumT += mode.duration;
    switch (mode.type) {
      case 'photo': sumPhoto += mode.duration; break;
      case 'video': sumVideo += mode.duration; break;
      case 'sleep': sumSleep += mode.duration; break;
      default: sumNothing += mode.duration; break;
    }
  });
  return ((sumPhoto / sumT) * 0.4 + (sumVideo / sumT) * 0.5 + (sumSleep / sumT) * 0.01 + (sumNothing / sumT) * 0.275).toFixed(3); 
}
*/
module.exports.modeReceiver = function modeReceiver(mode) {
  if (JSON.stringify(mode) !== JSON.stringify(currentMode)) {
    photoShooter.off();
    videoShooter.off();
    currentMode = cloneMode(mode);
    actions = cloneMode(mode);
    console.log('new mode!');
  }
}

module.exports.RTVReceiver = function RTVReceiver(newRTV) {
  if (RTV !== newRTV) {
    RTV = newRTV;
    if(RTV) {
      photoShooter.off();
      videoShooter.off();
      fileSender.off();
      console.log('command on');
      exec('h264_v4l2_rtspserver -F 5', (error, stout, sterr) => {
        log(`error: ${error}, stout: ${stout}, sterr: ${sterr}`);
      });
    } else {
      console.log('command off');
      exec('killall h264_v4l2_rtspserver', (error, stout, sterr) => {
        log(`error: ${error}, stout: ${stout}, sterr: ${sterr}`);
      });
    }
    console.log('new RTV ' + RTV);
  }
}

function getData(callback) {
  statisticsSender.getStatistics((err, docs) => {
    if (err) { throw err; }
    callback(null, docs);
  });
}

function decide(/*data, */callback) {
  if (!RTV) {
    fileSender.on();
    if (actions.length > 0) {
      switch (actions[0].type) {
        case 'photo':
          if (actions[0].duration > 0) {
            photoShooter.on(); 
            actions[0].duration -= 1;
          } else {
            photoShooter.off();
            actions = actions.slice(1);
          }
          break;
        case 'video': 
          if (actions[0].duration > 0) {
            videoShooter.on(); 
            actions[0].duration -= 1;
          } else {
            videoShooter.off();
            actions = actions.slice(1);
          }
          break;
        case 'sleep':
          if (actions[0].duration > 0) {
            fs.writeFile(path.resolve('./currentMode'), JSON.stringify(currentMode));
            fs.writeFile(path.resolve('./doAfterSleep'), JSON.stringify(actions.slice(1)));
            fs.writeFile(path.resolve('/tmp/sleepSec'), actions[0].duration);
          } else {
            actions = actions.slice(1);
          }
          break;
        default:
          if (actions[0].duration > 0) {
            actions[0].duration -= 1;
          } else {
            actions = actions.slice(1);
          }
          break;
      }
    } else { if (currentMode.length > 0) {actions = cloneMode(currentMode);} }
    console.log(actions);
  }
  callback();
}

function brain() {
  //getData((err, data) => {
    //if (err) { throw err; }
  decide(/*data, */() => {
    setTimeout(brain, options.brainInterval);
  });
  //});
  //log('brain tick');
}

module.exports.init = function brainInit() {
  brain();
  fs.stat(path.resolve('./currentMode'), (err) => {
    if(!err) {
      fs.readFile(path.resolve('./currentMode'), (err, data) => {
        fs.unlink(path.resolve('./currentMode'), () => {
          currentMode = JSON.parse(data);
        });
      });
    }
  })
  fs.stat(path.resolve('./doAfterSleep'), (err) => {
    if(!err) {
      fs.readFile(path.resolve('./doAfterSleep'), (err, data) => {
        fs.unlink(path.resolve('./doAfterSleep'), () => {
          actions = JSON.parse(data);
        });
      });
    }
  })
};
