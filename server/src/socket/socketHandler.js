let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[FINSETU Socket] 🔌 Client connected: ${socket.id}`);

    // Allow clients to join specific channels (e.g. security room, user notifications)
    socket.on('join_channel', (channel) => {
      socket.join(channel);
      console.log(`[FINSETU Socket] Socket ${socket.id} joined channel: ${channel}`);
    });

    socket.on('leave_channel', (channel) => {
      socket.leave(channel);
      console.log(`[FINSETU Socket] Socket ${socket.id} left channel: ${channel}`);
    });

    socket.on('disconnect', () => {
      console.log(`[FINSETU Socket] ❌ Client disconnected: ${socket.id}`);
    });
  });
};

export const getIO = () => ioInstance;

export const emitAttackEvent = (event) => {
  if (ioInstance) {
    ioInstance.emit('attack_event', event);
  }
};

export const emitImpactEvent = (impact) => {
  if (ioInstance) {
    ioInstance.emit('impact_event', impact);
  }
};

export const emitSecurityAlert = (alert) => {
  if (ioInstance) {
    ioInstance.emit('security_alert', alert);
  }
};

export const emitTransactionUpdate = (transaction) => {
  if (ioInstance) {
    ioInstance.emit('transaction_update', transaction);
  }
};

export const emitLoginUpdate = (loginData) => {
  if (ioInstance) {
    ioInstance.emit('login_activity_update', loginData);
  }
};
