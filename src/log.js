const options = require('./camOptions');
const fs = require('fs');
const dateformat = require('dateformat');
const path = require('path');

module.exports = function log(data) {
  let str = '';
  if (typeof(data) === 'string') {
    str = data.substring(0);
  } else {
    str = JSON.stringify(data);
  }
  fs.appendFile(
   path.resolve(options.logFile),
   `${dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')}    ${str}\n`
  );
  console.log(str);
};
