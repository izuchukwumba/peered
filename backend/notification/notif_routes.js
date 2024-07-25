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
router.put(
  "/:notifId/update-read-notifications",
  authMiddleware,
  notif_controllers.updateReadNotifications
);
router.put(
  "/update-all-offline-notifications",
  authMiddleware,
  notif_controllers.updateAllOfflineNotifications
);
router.post(
  "/new-notif-interaction",
  authMiddleware,
  notif_controllers.saveNewNotificationInteraction
);

module.exports = router;
