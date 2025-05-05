// api/socketio.js
const socketIo = require("socket.io");
const socketService = require("../services/socket/socketService");

module.exports = (req, res) => {
  if (req.method === "GET") {
    res.setHeader("Content-Type", "text/plain");
    res.end("Socket.io endpoint running");
    return;
  }

  // Check if socket.io is already initialized
  if (!res.socket.server.io) {
    console.log("Initializing Socket.io server");

    const io = socketIo(res.socket.server, {
      path: "/api/socketio",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      },
    });

    // Initialize the socket service with our io instance
    socketService.initialize(io);

    // Store io instance to prevent re-initialization
    res.socket.server.io = io;
  } else {
    console.log("Socket.io already initialized");
  }

  res.end("Socket.io server running");
};
