const express = require("express");
const router = express.Router();
const validateTaskId = require("@src/middleware/validate-task-id");
const getTaskById = require("./get-by-id");
const listTasks = require("./list");
const createTask = require("./create");
const updateTask = require("./update");
const deleteTask = require("./delete");

router.get("/", listTasks.validator, listTasks.handler);
router.post("/", createTask.validator, createTask.handler);
router.all("/:id", validateTaskId);
router.get("/:id", getTaskById.handler);
router.put("/:id", updateTask.validator, updateTask.handler);
router.delete("/:id", deleteTask.handler);

module.exports = router;
