const express = require("express");
const router = express.Router();
const cg_controllers = require("./cg_controllers");
const authMiddleware = require("../authentication/auth_middleware");

router.post("/new/code-group", authMiddleware, cg_controllers.createGroup);
router.get(
  "/user/created-groups",
  authMiddleware,
  cg_controllers.getGroupsCreatedByUser
);
router.get(
  "/user/group-memberships",
  authMiddleware,
  cg_controllers.getGroupMemberships
);
router.get("/search-for-image", cg_controllers.getGroupImageUrl);
router.get("/group/:groupId", authMiddleware, cg_controllers.getGroupDetails);
router.put(
  "/group/:groupId/update-code-group",
  authMiddleware,
  cg_controllers.updateGroupDetails
);

module.exports = router;
