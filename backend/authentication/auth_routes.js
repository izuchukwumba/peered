const express = require("express");
const router = express.Router();
const authController = require("./auth_controller");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.put("/user/:username/profile-build", authController.updateProfile);
router.get("/github", authController.githubAuth);
router.get("/github/callback", authController.githubCallback);
router.get("/user/:username/get-user-details", authController.getUserInfo);
router.post("/logout", authController.logout);

module.exports = router;
