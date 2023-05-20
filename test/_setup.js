require("module-alias/register");
require("dotenv").config({ path: ".env.test" });
const db = require("@src/db");

try {
  db.init("");
}
catch (e) {
  if (e.message !== "Database has already been configured") {
    throw e;
  }
}