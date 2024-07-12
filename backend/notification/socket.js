const { Server } = require("socket.io");
const http = require("http");
const FRONTEND_URL = process.env.FRONTEND_URL;

const userSocketMap = new Map();

const createSocketServer = (app) => {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("register", (userId) => {
      userSocketMap.set(userId, socket);
    });
    socket.on("disconnect", () => {
      for (let [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          break;
        }
      }
    });

    socket.on("added_user_to_group", (data) => {
      const { userId, message } = data;
      const userSocketId = userSocketMap.get(userId);
      if (userSocketId) {
        userSocketId.emit("user_added", { message });
      }
    });

    socket.on("notify_group", (data) => {
      const { userIds, message } = data;

      userIds.forEach((userId) => {
        const userSocketId = userSocketMap.get(userId);
        if (userSocketId) {
          userSocketId.emit("group_notification", { message });
        }
      });
    });
  });
  return { server, io, userSocketMap };
};
module.exports = { createSocketServer, userSocketMap };
