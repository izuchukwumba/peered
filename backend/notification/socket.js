const { Server } = require("socket.io");
const http = require("http");
const { RateLimiterMemory } = require("rate-limiter-flexible");
const { socket_names } = require("./notif_categories_backend");
const FRONTEND_URL = process.env.FRONTEND_URL;
const userSocketMap = new Map();
const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60 * 1,
});

const createSocketServer = (app) => {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  //Rate Limiter middleware
  io.use(async (socket, next) => {
    try {
      await rateLimiter.consume(socket.id);
      next();
    } catch (rejRes) {
      socket.emit(
        socket_names.rate_limit,
        "Too many notifications. Try again later"
      );
    }
  });

  //Rate Limiter middleware
  io.use(async (socket, next) => {
    try {
      await rateLimiter.consume(socket.id);
      next();
    } catch (rejRes) {
      socket.emit(
        socket_names.rate_limit,
        "Too many notifications. Try again later"
      );
    }
  });

  io.on(socket_names.connection, (socket) => {
    socket.on(socket_names.register, (userId) => {
      userSocketMap.set(userId, socket);
    });

    socket.on(socket_names.added_user_to_group, async (data) => {
      const { userId, message } = data;

      try {
        await rateLimiter.consume(userId);
        const userSocketId = userSocketMap.get(userId);
        if (userSocketId) {
          userSocketId.emit(socket_names.added_user_to_group, { message });
        }
      } catch (rejRes) {
        socket.emit("Too many notifications. Please try again later.");
      }
    });

    socket.on(socket_names.group_notifications, async (data) => {
      const { userIds, message } = data;
      userIds.forEach((userId) => {
        const userSocketId = userSocketMap.get(userId);
        if (userSocketId) {
          try {
            rateLimiter.consume(userId);
            userSocketId.emit(socket_names.group_notifications, { message });
          } catch (rejRes) {
            socket.emit("Too many notifications. Please try again later.");
          }
        }
      });
    });
  });
  return { server, io, userSocketMap };
};
module.exports = { createSocketServer, userSocketMap, rateLimiter };
