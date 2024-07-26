const express = require("express");
const router = express.Router();
const ur_controller = require("./recommendation_controller");

router.get("/:groupId", ur_controller.recommendPeers);

module.exports = router;
