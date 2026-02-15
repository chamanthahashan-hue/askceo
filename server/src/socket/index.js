let io;

function initSocket(server) {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: '*'
    }
  });

  io.on('connection', (socket) => {
    socket.on('join:user', (userId) => {
      socket.join(`user:${userId}`);
    });

    socket.on('join:admin', () => {
      socket.join('admin');
    });
  });

  return io;
}

function getIo() {
  return io;
}

module.exports = { initSocket, getIo };
