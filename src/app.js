const express = require("express");
const morgan = require("morgan");
const app = express();

app.use(morgan("combined"));
app.use(express.json());

app.use("/test", (req, res, next) => {
  res.status(200).send({ success: true });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
