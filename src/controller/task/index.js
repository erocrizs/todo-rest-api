const express = require("express");
const router = express.Router();
const validateTaskId = require("@src/middleware/validate-task-id");
const getTaskById = require("./get-by-id");

router.all("/:id", validateTaskId);
router.get("/:id", getTaskById.handler);

module.exports = router;