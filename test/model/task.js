const chai = require("chai");
const sinon = require("sinon");
const Task = require("@src/model/task");
const db = require("@src/db");
const { DataError } = require("node-json-db");

const expect = chai.expect;

describe("Model > Task", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

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

  describe("Task.findById", () => {
    let mockDbInstance;

    beforeEach(() => {
      mockDbInstance = {
        getData: sinon.stub(),
      };
      sandbox.stub(db, "get").returns(mockDbInstance);
    });

    it("should get the task from the database and return the result as a task", async () => {
      const testId = "59403f04-c01e-4ce6-be0a-de807ffd0b13";

      const mockResult = {
        title: "Test task",
        description: "This is a sample task for testing",
        isDone: false,
      };
      mockDbInstance.getData.returns(mockResult);

      const result = await Task.findById(testId);
      expect(mockDbInstance.getData).to.have.been.calledWith(`/task/${testId}`);
      expect(result).instanceOf(Task);
      expect(result.id).to.equal(testId);
      expect(result.title).to.equal(mockResult.title);
      expect(result.description).to.equal(mockResult.description);
      expect(result.isDone).to.equal(mockResult.isDone);
    });

    it("should throw an error if the ID is not valid", async () => {
      mockDbInstance.getData.returns({});
      expect(Task.findById("invalid-[id]-format")).to.be.rejectedWith(
        "invalid id format"
      );
    });

    it("should return null if the database returns empty", async () => {
      const testId = "59403f04-c01e-4ce6-be0a-de807ffd0b13";
      mockDbInstance.getData.rejects(
        new DataError(`Can't find dataPath: ${testId}`)
      );
      const result = await Task.findById(testId);
      expect(result).to.be.null;
    });

    it("should throw unexpected error by the database", async () => {
      mockDbInstance.getData.rejects(new DataError("Unexpected error"));
      expect(
        Task.findById("59403f04-c01e-4ce6-be0a-de807ffd0b13")
      ).to.be.rejectedWith("Unexpected error");
    });
  });
});
