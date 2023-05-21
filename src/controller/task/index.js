const express = require("express");
const router = express.Router();
const validateTaskId = require("@src/middleware/validate-task-id");
const getTaskById = require("./get-by-id");
const listTasks = require("./list");

router.get("/", listTasks.validator, listTasks.handler);
router.all("/:id", validateTaskId);
router.get("/:id", getTaskById.handler);

module.exports = router;
