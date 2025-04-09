// services/socket/socketService.js
let io;

const initialize = (socketIo) => {
  io = socketIo;

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Client joining a table room
    socket.on("joinTable", (data) => {
      const { branchId, tableName } = data;
      const roomName = `table:${branchId}:${tableName}`;
      socket.join(roomName);
      console.log(`Client joined table room: ${roomName}`);
    });

    // Kitchen staff joining a branch room
    socket.on("joinKitchen", (data) => {
      const { branchId } = data;
      const roomName = `kitchen:${branchId}`;
      socket.join(roomName);
      console.log(`Kitchen staff joined kitchen room: ${roomName}`);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

// Function to emit events to rooms
const emitToRoom = (room, event, data) => {
  if (!io) {
    console.log("Socket.io not initialized");
    return;
  }
  console.log(`Emitting ${event} to ${room}:`, data);
  io.to(room).emit(event, data);
};

module.exports = { initialize, emitToRoom };
