var options = require('./camOptions');
var fs = require('fs');
var path = require('path');
var dateformat = require('dateformat');

module.exports = function statisticsWriter(object) {
  fs.appendFile(path.resolve(file), JSON.stringify(object));
};
