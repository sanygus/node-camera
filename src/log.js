var options = require('./camOptions');
var fs = require('fs');
var dateformat = require('dateformat');
var path = require('path');

module.exports = function log(data) {
  var str = '';
  if (typeof(data) === 'string') {
    str = data.substring(0);
  } else {
    str = JSON.stringify(data);
  }
  fs.appendFile(
   path.resolve(options.logFile),
   dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss    ') + str + '\n'
  );
  console.log(str);
};
