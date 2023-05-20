const _ = require("lodash");
const db = require("@src/db");

class Task {
  #id = null;
  static #isInternalConstructing = false;

  constructor({ id, title, description, isDone }) {
    if (!Task.#isInternalConstructing) {
      throw new TypeError("Task is not constructable");
    }
    Task.#isInternalConstructing = false;

    this.#id = id ?? null;
    this.title = title;
    this.description = description;
    this.isDone = isDone;
  }

  static #createInternal(fields) {
    Task.#isInternalConstructing = true;
    return new Task(fields);
  }

  static create({ title, description = null, isDone = false }) {
    if (_.isNil(title)) {
      throw TypeError("title field is required");
    }

    return Task.#createInternal({ title, description, isDone });
  }

  get id() {
    return this.#id;
  }

  set id(value) {
    throw new TypeError("id cannot manually be set");
  }

  static async findById(id) {
    if (id.match(/[^0-9a-f-]/)) {
      throw new TypeError("invalid id format");
    }

    const instance = db.get();
    let task = null;
    try {
      task = await instance.getData(`/task/${id}`);
    }
    catch (error) {
      if (!error.message.match(/Can't find dataPath/)) {
        throw error;
      }
    }

    if (_.isNil(task)) {
      return null;
    }

    return Task.#createInternal({
      id,
      ...task
    });
  }
}

module.exports = Task;
