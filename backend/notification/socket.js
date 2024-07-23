const { Server } = require("socket.io");
const http = require("http");
const { socket_names } = require("./notif_categories_backend");
const RateLimiter = require("./rate_limiter");

const FRONTEND_URL = process.env.FRONTEND_URL;
const rateLimiter = new RateLimiter(60, 5); //5 requests per 60seconds before it gets ratelimited

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

  //Rate Limiter middleware
  io.use(async (socket, next) => {
    try {
      await rateLimiter.useRateLimiter(socket.id);
      next();
    } catch (rate_limit_message) {
      socket.emit(socket_names.rate_limit, rate_limit_message);
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

    socket.on(socket_names.disconnect, () => {
      for (let [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          break;
        }
      }
    });
    
    socket.on(socket_names.added_user_to_group, async (data) => {
      const { userId, message } = data;

      try {
        await rateLimiter.useRateLimiter(userId);
        const userSocketId = userSocketMap.get(userId);
        if (userSocketId) {
          userSocketId.emit(socket_names.added_user_to_group, { message });
        }
      } catch (rate_limit_message) {
        socket.emit(socket_names.rate_limit, rate_limit_message);
      }
    });

    socket.on(socket_names.group_notifications, async (data) => {
      const { userIds, message } = data;
      userIds.forEach((userId) => {
        const userSocketId = userSocketMap.get(userId);
        if (userSocketId) {
          try {
            rateLimiter.useRateLimiter(userId);
            userSocketId.emit(socket_names.group_notifications, { message });
          } catch (rate_limit_message) {
            socket.emit(socket_names.rate_limit, rate_limit_message);
          }
        }
      });
    });
  });
  return { server, io, userSocketMap };
};
module.exports = { createSocketServer, userSocketMap, rateLimiter };
