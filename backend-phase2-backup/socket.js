const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function init(httpServer, options = {}) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:8081',
      credentials: true,
    },
    ...options,
  });

  // Basic auth for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      return next();
    } catch (err) {
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    try {
      // Join rooms: user-specific room
      const userId = socket.user?.userId;
      if (userId) {
        socket.join(`user_${userId}`);
      }

      // Allow clients to join channel/team/project rooms explicitly
      socket.on('joinRoom', ({ type, id }) => {
        if (!type || !id) return;
        socket.join(`${type}_${id}`);
      });

      socket.on('leaveRoom', ({ type, id }) => {
        if (!type || !id) return;
        socket.leave(`${type}_${id}`);
      });

      // Backwards compatibility: support join-channel / leave-channel events
      socket.on('join-channel', (channelId) => {
        if (!channelId) return;
        socket.join(`channel_${channelId}`);
      });
      socket.on('leave-channel', (channelId) => {
        if (!channelId) return;
        socket.leave(`channel_${channelId}`);
      });

      // Typing indicator relay
      socket.on('typing', (data) => {
        const { channelId } = data || {};
        if (!channelId) return;
        io.to(`channel_${channelId}`).emit('user-typing', data);
      });

      socket.on('disconnect', (reason) => {
        // simple log; client will handle UI
        // console.log('Socket disconnected', socket.id, reason);
      });
    } catch (err) {
      // ignore
    }
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized. Call init(server) first.');
  return io;
}

module.exports = {
  init,
  getIO,
};
