const express = require('express');
const router = express.Router();
const taskRouter = require('./task');

router.use('/task', taskRouter);

module.exports = router;
