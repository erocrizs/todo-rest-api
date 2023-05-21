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

  describe(".json()", () => {
    const testData = Task.create({
      title: "Test task",
      description: "This is a sample task for testing",
      isDone: false,
    });

    it("should return a plain object with the relevant fields", () => {
      expect(testData.json()).to.deep.equal({
        id: null,
        title: "Test task",
        description: "This is a sample task for testing",
        isDone: false,
      });
    });
  });

  describe(".save", () => {
    let mockDbInstance;

    beforeEach(() => {
      mockDbInstance = {
        getIndex: sinon.stub(),
        push: sinon.stub(),
      };
      sandbox.stub(db, "get").returns(mockDbInstance);
    });

    it("should insert to the database if the task has no ID", async () => {
      mockDbInstance.getIndex.resolves(-1);

      const newTask = Task.create({
        title: "Test task",
        description: "This is a sample task for testing",
        isDone: false,
      });

      await newTask.save();

      expect(newTask.id).to.be.a("string");
      expect(mockDbInstance.push).to.have.been.calledWithExactly(
        "/task[]",
        {
          id: newTask.id,
          title: "Test task",
          description: "This is a sample task for testing",
          isDone: false,
        },
        true
      );
    });

    it("should update the database if the task already has an ID and is in the database", async () => {
      mockDbInstance.getIndex.resolves(4);
      const existingTask = Task.createForTest({
        id: "dcbe3721-2143-4b63-bc88-176b8b6f08ce",
        title: "Do laundry",
        description: "Wash and fold the laundry",
        isDone: false,
      });

      await existingTask.save();
      expect(mockDbInstance.push).to.have.been.calledWithExactly(
        "/task[4]",
        {
          id: "dcbe3721-2143-4b63-bc88-176b8b6f08ce",
          title: "Do laundry",
          description: "Wash and fold the laundry",
          isDone: false,
        },
        true
      );
    });

    it("should insert to the database if the task already has an ID but is not in the database", async () => {
      mockDbInstance.getIndex.resolves(-1);
      const existingTask = Task.createForTest({
        id: "dcbe3721-2143-4b63-bc88-176b8b6f08ce",
        title: "Do laundry",
        description: "Wash and fold the laundry",
        isDone: false,
      });

      await existingTask.save();
      expect(mockDbInstance.push).to.have.been.calledWithExactly(
        "/task[]",
        {
          id: "dcbe3721-2143-4b63-bc88-176b8b6f08ce",
          title: "Do laundry",
          description: "Wash and fold the laundry",
          isDone: false,
        },
        true
      );
    });
  });

  describe("Task.create()", () => {
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

  describe("Task.createForTest()", () => {
    it("should create a new Task instance", () => {
      const fields = {
        id: "sample-id",
        title: "Test task",
        description: "This is a sample task for testing",
        isDone: false,
      };

      const testTask = Task.createForTest(fields);
      expect(testTask).instanceOf(Task);
      expect(testTask.id).to.equal(fields.id);
      expect(testTask.title).to.equal(fields.title);
      expect(testTask.description).to.equal(fields.description);
      expect(testTask.isDone).to.equal(fields.isDone);
    });

    it("should throw an error when used outside of test environment", () => {
      const fields = {
        id: "sample-id",
        title: "Test task",
        description: "This is a sample task for testing",
        isDone: false,
      };

      const envStub = sandbox.stub(process.env, "NODE_ENV").value("production");
      expect(() => Task.createForTest(fields)).to.throw(
        "not usable in non-test environment"
      );
      envStub.restore();
    });
  });

  describe("Task.findById()", () => {
    let mockDbInstance;

    beforeEach(() => {
      mockDbInstance = {
        getIndex: sinon.stub(),
        getData: sinon.stub(),
      };
      sandbox.stub(db, "get").returns(mockDbInstance);
    });

    it("should get the task from the database and return the result as a task", async () => {
      const testId = "59403f04-c01e-4ce6-be0a-de807ffd0b13";

      const mockResult = {
        id: "59403f04-c01e-4ce6-be0a-de807ffd0b13",
        title: "Test task",
        description: "This is a sample task for testing",
        isDone: false,
      };
      mockDbInstance.getIndex.returns(1);
      mockDbInstance.getData.withArgs("/task[1]").returns(mockResult);

      const result = await Task.findById(testId);
      expect(result).instanceOf(Task);
      expect(result.id).to.equal(testId);
      expect(result.title).to.equal(mockResult.title);
      expect(result.description).to.equal(mockResult.description);
      expect(result.isDone).to.equal(mockResult.isDone);
    });

    it("should throw an error if the ID is not valid", async () => {
      mockDbInstance.getIndex.returns(1);
      mockDbInstance.getData.rejects(new Error("should not be called"));
      expect(Task.findById("invalid-[id]-format")).to.be.rejectedWith(
        "invalid id format"
      );
      expect(mockDbInstance.getData).to.have.not.been.called;
    });

    it("should return null if the database returns empty", async () => {
      const testId = "59403f04-c01e-4ce6-be0a-de807ffd0b13";
      mockDbInstance.getIndex.returns(-1);
      mockDbInstance.getData.rejects(new Error("should not be called"));
      const result = await Task.findById(testId);
      expect(result).to.be.null;
      expect(mockDbInstance.getIndex).to.have.been.called;
      expect(mockDbInstance.getData).to.have.not.been.called;
    });

    it("should throw unexpected error by the database", async () => {
      mockDbInstance.getData.rejects(new DataError("Unexpected error"));
      expect(
        Task.findById("59403f04-c01e-4ce6-be0a-de807ffd0b13")
      ).to.be.rejectedWith("Unexpected error");
    });
  });

  describe("Task.list()", () => {
    const mockData = [
      {
        id: "59403f04-c01e-4ce6-be0a-de807ffd0b13",
        title: "Buy catfood",
        description: "My cat likes wet catfood, avoid dry",
        isDone: false,
      },
      {
        id: "d6c8e1a6-8e8f-45c7-92e2-589b2fb53211",
        title: "Take out the trash",
        description: "Empty all the trash bins in the house",
        isDone: true,
      },
      {
        id: "dcbe3721-2143-4b63-bc88-176b8b6f08ce",
        title: "Do laundry",
        description: "Wash and fold the laundry",
        isDone: false,
      },
      {
        id: "aa32c242-431f-4d9e-9823-4689e6cc6c21",
        title: "Clean the bathroom",
        description: "Scrub the toilet, sink, and bathtub",
        isDone: true,
      },
      {
        id: "23bc329d-d437-4623-8d8c-d4c86a9f8a0a",
        title: "Pay bills",
        description: "Settle utility bills and other pending payments",
        isDone: false,
      },
      {
        id: "1f361bd2-b5d4-4e44-b792-c2a9f9e529c7",
        title: "Go grocery shopping",
        description: "Purchase groceries and household essentials",
        isDone: false,
      },
    ];
    let mockDbInstance;

    beforeEach(() => {
      mockDbInstance = {
        getData: sinon.stub().callsFake(async () => [...mockData]),
      };
      sandbox.stub(db, "get").returns(mockDbInstance);
    });

    it("should return the paginated list of tasks", async () => {
      const firstPageTasks = await Task.list({ page: 0, count: 4 });
      const secondPageTasks = await Task.list({ page: 1, count: 4 });
      const thirdPageTasks = await Task.list({ page: 2, count: 4 });
      expect(firstPageTasks.length).to.equal(4);
      expect(firstPageTasks.every((t) => t instanceof Task)).to.equal(true);
      expect(firstPageTasks.map((t) => t.json())).to.deep.equal([
        mockData[0],
        mockData[1],
        mockData[2],
        mockData[3],
      ]);

      expect(secondPageTasks.length).to.equal(2);
      expect(secondPageTasks.every((t) => t instanceof Task)).to.equal(true);
      expect(secondPageTasks.map((t) => t.json())).to.deep.equal([
        mockData[4],
        mockData[5],
      ]);

      expect(thirdPageTasks.length).to.equal(0);
    });

    it("should return the first 5 tasks when no options are given", async () => {
      const tasks = await Task.list();
      expect(tasks.length).to.equal(5);
      expect(tasks.every((t) => t instanceof Task)).to.equal(true);
      expect(tasks.map((t) => t.json())).to.deep.equal([
        mockData[0],
        mockData[1],
        mockData[2],
        mockData[3],
        mockData[4],
      ]);
    });

    it("should filter the list of tasks", async () => {
      const firstTaskList = await Task.list({
        filter: { title: "This title does not exist" },
      });
      const secondTaskList = await Task.list({
        filter: { description: "Wash and fold the laundry" },
      });
      const thirdTaskList = await Task.list({ filter: { isDone: true } });
      expect(firstTaskList.map((t) => t.json())).to.deep.equal([]);
      expect(secondTaskList.map((t) => t.json())).to.deep.equal([mockData[2]]);
      expect(thirdTaskList.map((t) => t.json())).to.deep.equal([
        mockData[1],
        mockData[3],
      ]);
    });
  });

  describe("Task.isExistingId()", () => {
    const testId = "59403f04-c01e-4ce6-be0a-de807ffd0b13";
    let mockDbInstance;

    beforeEach(() => {
      mockDbInstance = {
        getIndex: sinon.stub(),
      };
      sandbox.stub(db, "get").returns(mockDbInstance);
    });

    it("should return false if the database cannot find the ID", async () => {
      mockDbInstance.getIndex.returns(-1);
      const isExisting = await Task.isExistingId(testId);
      expect(isExisting).to.be.false;
    });

    it("should return true if the database finds the ID", async () => {
      mockDbInstance.getIndex.returns(4);
      const isExisting = await Task.isExistingId(testId);
      expect(isExisting).to.be.true;
    });
  });
});
