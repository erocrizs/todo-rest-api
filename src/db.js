const { JsonDB, Config } = require("node-json-db");

let db = null;

const init = (filepath) => {
  if (db) {
    throw new Error("Database has already been configured");
  }

  db = new JsonDB(new Config(filepath, true, false, "/"));
};

const get = () => {
  if (db) {
    return db;
  }

  throw new Error("Database has not been configured");
};

module.exports = {
  get,
  init,
};
