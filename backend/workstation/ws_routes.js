const express = require("express");
const router = express.Router();
const ws_controllers = require("./ws_controllers");
const authMiddleware = require("../authentication/auth_middleware");

router.get(
  "/:groupId/files/:fileId/get-file-details",
  authMiddleware,
  ws_controllers.getFileDetails
);
router.post(
  "/:groupId/create-new-file",
  authMiddleware,
  ws_controllers.createNewFile
);
router.put(
  "/:groupId/files/:fileId/update-file",
  authMiddleware,
  ws_controllers.updateFileDetails
);
router.delete(
  "/:groupId/files/:fileId/delete-file",
  authMiddleware,
  ws_controllers.deleteFile
);
router.post(
  "/:groupId/files/:fileId/workstation/run-code",
  authMiddleware,
  ws_controllers.runCode
);
router.get(
  "/:groupId/files/:fileId/download",
  authMiddleware,
  ws_controllers.downloadFile
);

module.exports = router;
