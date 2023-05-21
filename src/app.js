const express = require("express");
const morgan = require("morgan");
const router = require("./controller/router");
const { ValidationError } = require("express-validation");
const app = express();

if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
}
app.use(express.json());

app.use("/ping", (req, res, next) => {
  res.status(200).send({ pong: true });
});

app.use(router);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    res.status(err.statusCode);
    res.send({ error: err.details });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
