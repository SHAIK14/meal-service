// services/socket/socketService.js
let io;

const initialize = (socketIo) => {
  io = socketIo;

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Client joining a table room with acknowledgment
    socket.on("joinTable", (data, callback) => {
      const { branchId, tableName } = data;
      
      if (!branchId || !tableName) {
        console.log(`Invalid joinTable parameters:`, data);
        
        if (typeof callback === 'function') {
          callback({ success: false, message: 'Invalid parameters' });
        }
        return;
      }
      
      const roomName = `table:${branchId}:${tableName}`;
      
      // Leave any previous table rooms
      Array.from(socket.rooms)
        .filter(room => room.startsWith('table:'))
        .forEach(room => socket.leave(room));
      
      // Join the new room
      socket.join(roomName);
      
      console.log(`Client ${socket.id} joined table room: ${roomName}`);
      
      // Send acknowledgment if callback provided
      if (typeof callback === 'function') {
        callback({ success: true, room: roomName });
      }
    });

    // Kitchen staff joining a branch room with acknowledgment
    socket.on("joinKitchen", (data, callback) => {
      const { branchId, clientType } = data;
      
      if (!branchId) {
        console.error(`Invalid joinKitchen parameter: branchId=${branchId}`);
        
        if (typeof callback === 'function') {
          callback({ success: false, message: 'Invalid branch ID' });
        }
        return;
      }
      
      const roomName = `kitchen:${branchId}`;
      
      // Leave any previous kitchen rooms
      Array.from(socket.rooms)
        .filter(room => room.startsWith('kitchen:'))
        .forEach(room => socket.leave(room));
      
      // Join the new room
      socket.join(roomName);
      
      // List all rooms this socket is in after joining
      const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
      console.log(`Kitchen staff ${socket.id} joined kitchen room: ${roomName}`);
      console.log(`Socket ${socket.id} is now in rooms:`, rooms);
      
      // Count sockets in the room
      const roomSockets = io.sockets.adapter.rooms.get(roomName);
      const socketCount = roomSockets ? roomSockets.size : 0;
      console.log(`${socketCount} client(s) now in kitchen room: ${roomName}`);
      
      // Send acknowledgment if callback provided
      if (typeof callback === 'function') {
        callback({ success: true, room: roomName, socketCount });
      }
      
      // Send a confirmation event back to the client
      socket.emit("kitchen_room_joined", {
        roomName,
        branchId,
        timestamp: new Date().toISOString()
      });
    });
    
    // Check room status handler
    socket.on("check_room_status", (data, callback) => {
      const { branchId } = data;
      
      if (!branchId) {
        if (typeof callback === 'function') {
          callback({ success: false, message: 'Invalid branch ID' });
        }
        return;
      }
      
      const tableRooms = Array.from(socket.rooms)
        .filter(room => room.startsWith(`table:${branchId}`));
      
      const kitchenRooms = Array.from(socket.rooms)
        .filter(room => room.startsWith(`kitchen:${branchId}`));
      
      const kitchenRoomName = `kitchen:${branchId}`;
      const roomSockets = io.sockets.adapter.rooms.get(kitchenRoomName);
      const socketCount = roomSockets ? roomSockets.size : 0;
      
      if (typeof callback === 'function') {
        callback({
          success: true,
          inTableRooms: tableRooms.length > 0,
          inKitchenRooms: kitchenRooms.length > 0,
          tableRooms,
          kitchenRooms,
          kitchenRoomClients: socketCount
        });
      }
    });
    
    // Debug handler - can be used for troubleshooting
    socket.on("debug_connection", (data) => {
      console.log("Debug connection data:", data);
      
      // List all rooms this socket is in
      const rooms = Array.from(socket.rooms);
      console.log(`Socket ${socket.id} is in rooms:`, rooms);
      
      // For each branchId-related room, list all clients
      rooms.forEach(room => {
        if (room.startsWith('kitchen:') || room.startsWith('table:')) {
          const roomSockets = io.sockets.adapter.rooms.get(room);
          const socketIds = roomSockets ? Array.from(roomSockets) : [];
          console.log(`Room ${room} has ${socketIds.length} clients:`, socketIds);
        }
      });
      
      // Send debug response
      socket.emit("debug_response", {
        socketId: socket.id,
        rooms,
        timestamp: new Date().toISOString()
      });
    });

    // Add force rejoin handler
    socket.on("force_rejoin_kitchen", (data) => {
      const { branchId } = data;
      
      if (!branchId) {
        socket.emit("force_rejoin_response", {
          success: false,
          message: "Missing branchId"
        });
        return;
      }
      
      const kitchenRoom = `kitchen:${branchId}`;
      
      // Leave any previous kitchen rooms
      Array.from(socket.rooms)
        .filter(room => room.startsWith('kitchen:'))
        .forEach(room => socket.leave(room));
      
      // Force join kitchen room
      socket.join(kitchenRoom);
      
      // List all sockets in the room
      const roomSockets = io.sockets.adapter.rooms.get(kitchenRoom);
      const socketIds = roomSockets ? Array.from(roomSockets) : [];
      
      console.log(`Force rejoined ${socket.id} to ${kitchenRoom}`);
      console.log(`Room ${kitchenRoom} now has ${socketIds.length} clients:`, socketIds);
      
      socket.emit("force_rejoin_response", {
        success: true,
        room: kitchenRoom,
        clientCount: socketIds.length
      });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

// Enhanced function to emit events to rooms with better logging
const emitToRoom = (room, event, data) => {
  if (!io) {
    console.error("Socket.io not initialized");
    return { success: false, message: "Socket.io not initialized" };
  }
  
  // Check if the room exists and has connections
  const roomSockets = io.sockets.adapter.rooms.get(room);
  const socketCount = roomSockets ? roomSockets.size : 0;
  const socketIds = roomSockets ? Array.from(roomSockets) : [];
  
  console.log(`Emitting ${event} to ${room} (${socketCount} clients connected)`);
  
  if (socketCount === 0) {
    console.log(`Warning: No clients in room ${room} for event ${event}`);
  } else {
    console.log(`Clients in room ${room}:`, socketIds);
  }
  
  // Emit event to all clients in the room
  io.to(room).emit(event, data);
  
  return { 
    success: true, 
    room, 
    event, 
    socketCount,
    socketIds
  };
};

module.exports = { initialize, emitToRoom };