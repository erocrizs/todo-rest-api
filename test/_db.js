const db = require("@src/db");

try {
  db.init("");
  const instance = db.get();
} catch (e) {
  if (e.message !== "Database has already been configured") {
    throw e;
  }
}
