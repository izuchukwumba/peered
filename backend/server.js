const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./authentication/auth_routes");
const cg_routes = require("./code_groups/cg_routes");
const ws_routes = require("./workstation/ws_routes");
const notif_routes = require("./notification/notif_routes");
const { createSocketServer } = require("./notification/socket");

const app = express();
const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const { server, io, userSocketMap } = createSocketServer(app);

app.use((req, res, next) => {
  req.io = io;
  req.userSocketMap = userSocketMap;
  next();
});

app.use("/auth", authRoutes);
app.use("/api", cg_routes);
app.use("/group", ws_routes);
app.use("/notif", notif_routes);

server.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
