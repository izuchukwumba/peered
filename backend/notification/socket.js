const { Server } = require("socket.io");
const http = require("http");
const { socket_names } = require("./notif_categories_backend");
const RateLimiter = require("./rate_limiter");

const FRONTEND_URL = process.env.FRONTEND_URL;
const TIME_WINDOW = 60; //in seconds
const MAXIMUM_REQUESTS = 5; //number of requests in TIME_WINDOW before notification is rate-limited
const rateLimiter = new RateLimiter(TIME_WINDOW, MAXIMUM_REQUESTS); //5 requests per 60seconds before it gets ratelimited

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

  io.on(socket_names.connection, (socket) => {
    socket.on(socket_names.register, (userId) => {
      userSocketMap.set(userId, socket);
    });

    socket.on(socket_names.disconnect, () => {
      for (let [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          break;
        }
      }
    });
  });
  return { server, io, userSocketMap };
};
module.exports = { createSocketServer, userSocketMap, rateLimiter };
