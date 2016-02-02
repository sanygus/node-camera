var dateformat = require('dateformat');

module.exports = function statisticsSender(socket, size, time) {
  if (socket.connected) {
    socket.emit('statistics', {
      date: dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
      size: size,
      time: time,
    });
  }
};
