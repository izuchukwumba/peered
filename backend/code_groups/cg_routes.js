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
router.get("/user/added-groups", authMiddleware, cg_controllers.getAddedGroups);

module.exports = router;
