const { Server } = require("socket.io");
const http = require("http");
const { RateLimiterMemory } = require("rate-limiter-flexible");
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
      socket.emit("rate-limit", "Too many notifications. Try again later");
    }
  });

  io.on("connection", (socket) => {
    socket.on("register", (userId) => {
      userSocketMap.set(userId, socket);
    });

    socket.on("added_user_to_group", async (data) => {
      const { userId, message } = data;

      try {
        await rateLimiter.consume(userId);
        const userSocketId = userSocketMap.get(userId);
        if (userSocketId) {
          userSocketId.emit("user_added", { message });
        }
      } catch (rejRes) {
        socket.emit("Too many notifications. Please try again later.");
      }
    });

    socket.on("notify_group", async (data) => {
      const { userIds, message } = data;
      userIds.forEach((userId) => {
        const userSocketId = userSocketMap.get(userId);
        if (userSocketId) {
          try {
            rateLimiter.consume(userId);
            userSocketId.emit("group_notification", { message });
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
