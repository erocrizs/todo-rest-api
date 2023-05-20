require("module-alias/register");
require("dotenv").config();
const db = require("@src/db");
const app = require("@src/app");

const DB_JSON = process.env.DB_JSON || "todo.json";
const PORT = process.env.PORT || 3000;

db.init(DB_JSON);

const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle shutting down safely
const shutdown = () => {
  server.close(() => {
    console.log("Server stopped");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("SIGHUP", shutdown);
process.on("SIGQUIT", shutdown);
