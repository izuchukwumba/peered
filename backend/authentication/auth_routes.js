const express = require("express");
const router = express.Router();
const authController = require("./auth_controller");
const authMiddleware = require("./auth_middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/github", authController.githubAuth);
router.get("/github/callback", authController.githubCallback);
router.post("/github/logout", authController.logout);

module.exports = router;
