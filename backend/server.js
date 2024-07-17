const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./authentication/auth_routes");
const cg_routes = require("./code_groups/cg_routes");
const ws_routes = require("./workstation/ws_routes");

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

app.use("/auth", authRoutes);
app.use("/api", cg_routes);
app.use("/group", ws_routes);

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
