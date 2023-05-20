const chai = require("chai");
const Task = require("@src/model/task");

const expect = chai.expect;

describe("Model > Task", () => {
  it("should not be constructable", () => {
    expect(() => {
      new Task({
        id: 123,
        title: "Test task",
        description: "This is a sample task for testing",
        isDone: false,
      });
    }).throws("Task is not constructable");
  });

  describe(".id", () => {
    const testData = Task.create({
      title: "Test task",
      description: "This is a sample task for testing",
      isDone: false,
    });

    it("should throw an error when attempting to set the id", () => {
      expect(() => {
        testData.id = "some-id-value";
      }).throws("id cannot manually be set");
    });
  });

  describe("Task.create", () => {
    it("should create a new Task instance", () => {
      const fields = {
        title: "Test task",
        description: "This is a sample task for testing",
        isDone: false,
      };

      const newTask = Task.create(fields);
      expect(newTask).instanceOf(Task);
      expect(newTask.title).to.equal(fields.title);
      expect(newTask.description).to.equal(fields.description);
      expect(newTask.isDone).to.equal(fields.isDone);
    });

    it("should not set the task ID", () => {
      const newTask = Task.create({
        id: "sample-id",
        title: "Test task",
        description: "This is a sample task for testing",
        isDone: false,
      });
      expect(newTask.id).to.be.null;
    });

    it("should throw an error without a title", () => {
      expect(() => {
        Task.create({
          description: "This is a sample task for testing",
          isDone: false,
        });
      }).throws("title field is required");
    });

    it("should have default values for description and isDone", () => {
      const newTask = Task.create({ title: "Test task" });
      expect(newTask.description).to.be.null;
      expect(newTask.isDone).to.equal(false);
    });
  });
});
