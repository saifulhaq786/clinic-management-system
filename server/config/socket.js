const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

const setupSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5177',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Middleware: Authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`👤 User ${socket.userId} connected`);

    // Real-time appointment updates
    socket.on('appointment:update', (data) => {
      io.emit('appointment:updated', { userId: socket.userId, data });
    });

    // Doctor availability change
    socket.on('doctor:availability', (data) => {
      io.emit('doctor:available', data);
    });

    // Live chat messages
    socket.on('message:send', (data) => {
      io.emit('message:received', { from: socket.userId, ...data });
    });

    // Appointment reminders
    socket.on('reminder:set', (appointmentId) => {
      socket.emit('reminder:scheduled', appointmentId);
    });

    socket.on('disconnect', () => {
      console.log(`👋 User ${socket.userId} disconnected`);
    });
  });

  return io;
};

module.exports = setupSocket;
