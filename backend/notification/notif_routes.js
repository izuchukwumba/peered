const express = require("express");
const router = express.Router();
const notif_controllers = require("./notif_controller");
const authMiddleware = require("../authentication/auth_middleware");

router.post(
  "/new/notification",
  authMiddleware,
  notif_controllers.saveNewNotification
);
router.get(
  "/get-all-notifications",
  authMiddleware,
  notif_controllers.getNotifications
);

module.exports = router;
