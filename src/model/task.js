const _ = require("lodash");
const uuid = require("uuid");
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

  json() {
    return {
      id: this.#id || null,
      title: this.title,
      description: this.description,
      isDone: this.isDone,
    };
  }

  async save() {
    if (_.isNil(this.#id)) {
      await this.#insertNew();
      return;
    }

    await this.#update();
  }

  async delete() {
    if (_.isNil(this.#id)) {
      throw TypeError("cannot delete a task with an empty ID");
    }

    const instance = db.get();
    const taskIndex = await instance.getIndex("/task", this.#id);

    if (taskIndex === -1) {
      throw TypeError("task not found");
    }

    await instance.delete(`/task[${taskIndex}]`);
    this.#id = null;
  }

  async #insertNew() {
    let id;

    do {
      id = uuid.v4();
    } while (await Task.isExistingId(id));

    const instance = db.get();
    const payload = this.json();
    payload.id = id;
    await instance.push("/task[]", payload, true);
    this.#id = id;
  }

  async #update() {
    const payload = this.json();
    const instance = db.get();
    const taskIndex = await instance.getIndex("/task", this.#id);

    if (taskIndex === -1) {
      await instance.push("/task[]", payload, true);
    }

    await instance.push(`/task[${taskIndex}]`, payload, true);
  }

  static async findById(id) {
    if (id.match(/[^0-9a-f-]/)) {
      throw new TypeError("invalid id format");
    }

    const instance = db.get();
    let task = null;
    const taskIndex = await instance.getIndex("/task", id);
    if (taskIndex === -1) {
      return null;
    }
    task = await instance.getData(`/task[${taskIndex}]`);

    if (_.isNil(task)) {
      return null;
    }

    return Task.#createInternal({
      id,
      ...task,
    });
  }

  static async list({ page = 0, count = 5, filter = {} } = {}) {
    const instance = db.get();
    let tasks = await instance.getData("/task");

    const validatedFilter = _.pick(filter, ["title", "description", "isDone"]);
    if (!_.isEmpty(validatedFilter)) {
      tasks = _.filter(tasks, validatedFilter);
    }

    const firstItemIndex = page * count;
    if (tasks.length <= firstItemIndex) {
      return [];
    }
    const getResult = _.slice(tasks, firstItemIndex, firstItemIndex + count);
    return getResult.map((t) => Task.#createInternal(t));
  }

  static async isExistingId(id) {
    if (id.match(/[^0-9a-f-]/)) {
      throw new TypeError("invalid id format");
    }

    const instance = db.get();
    const taskIndex = await instance.getIndex("/task", id);
    return taskIndex >= 0;
  }

  static createForTest({ id, title, description, isDone }) {
    if (process.env.NODE_ENV !== "test") {
      throw new Error("not usable in non-test environment");
    }

    return Task.#createInternal({ id, title, description, isDone });
  }
}

module.exports = Task;
