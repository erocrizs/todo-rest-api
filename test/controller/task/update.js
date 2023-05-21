const chai = require("chai");
const sinon = require("sinon");
const middlewares = require("@src/controller/task/update");
const Task = require("@src/model/task");
const { ValidationError } = require("express-validation");

const expect = chai.expect;

describe("Controller > Task > Get By ID", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe(".validator", () => {
    it("should call next if the the body has title, description, and isDone", async () => {
      const req = {
        body: {
          title: "Test task",
          description: "This is a sample task for testing",
          isDone: false,
        },
      };
      const res = {};
      const next = sandbox.stub();
      await middlewares.validator(req, res, next);
      expect(next).to.have.been.calledWithExactly();
    });

    it("should call next if the the body only has title", async () => {
      const req = {
        body: {
          title: "Test task",
        },
      };
      const res = {};
      const next = sandbox.stub();
      await middlewares.validator(req, res, next);
      expect(next).to.have.been.calledWithExactly();
    });

    it("should call next if the the body only has description", async () => {
      const req = {
        body: {
          description: "This is a sample task for testing",
        },
      };
      const res = {};
      const next = sandbox.stub();
      await middlewares.validator(req, res, next);
      expect(next).to.have.been.calledWithExactly();
    });

    it("should call next if the the body only has isDone", async () => {
      const req = {
        body: {
          isDone: false,
        },
      };
      const res = {};
      const next = sandbox.stub();
      await middlewares.validator(req, res, next);
      expect(next).to.have.been.calledWithExactly();
    });

    it("should call next with an error if the body is completely empty", (done) => {
      const req = {
        body: {},
      };
      const res = {};
      middlewares.validator(req, res, (err) => {
        try {
          expect(err).instanceOf(ValidationError);
          expect(err.statusCode).to.be.equal(400);
          done();
        } catch (testFail) {
          done(testFail);
        }
      });
    });
  });

  describe(".handler", () => {
    it("should respond with 200 and a JSON object of the updated task", async () => {
      const id = "23bc329d-d437-4623-8d8c-d4c86a9f8a0a";
      const body = {
        title: "Test task",
        description: "This is a sample task for testing",
        isDone: false,
      };
      const mockTask = Task.createForTest({
        id,
        title: "Pay bills",
        description: "Settle utility bills and other pending payments",
        isDone: false,
      });
      sandbox.stub(Task, "findById").resolves(mockTask);
      sandbox.stub(mockTask, "save").resolves();

      const req = { params: { id }, body };
      const res = {};
      res.status = sandbox.stub().returns(res);
      res.send = sandbox.stub().returns(res);
      await middlewares.handler(req, res);

      expect(mockTask.save).to.have.been.calledWithExactly();
      expect(res.status).to.have.been.calledWith(200);
      expect(res.send).to.have.been.calledWith({ id, ...body });
    });

    it("should respond with 404 and an error message if the task cannot be found", async () => {
      const id = "23bc329d-d437-4623-8d8c-d4c86a9f8a0a";
      sandbox.stub(Task, "findById").resolves(null);
      const req = {
        params: { id },
        body: {
          title: "Test task",
          description: "This is a sample task for testing",
          isDone: false,
        },
      };
      const res = {};
      res.status = sandbox.stub().returns(res);
      res.send = sandbox.stub().returns(res);
      await middlewares.handler(req, res);

      expect(res.status).to.have.been.calledWith(404);
      expect(res.send).to.have.been.calledWith({ error: "Not found" });
    });

    it("should respond with 200 when updating only the title", async () => {
      const id = "23bc329d-d437-4623-8d8c-d4c86a9f8a0a";
      const newTitle = "Test task";
      const mockTaskData = {
        id,
        title: "Pay bills",
        description: "Settle utility bills and other pending payments",
        isDone: false,
      };
      const mockTask = Task.createForTest(mockTaskData);
      sandbox.stub(Task, "findById").resolves(mockTask);
      sandbox.stub(mockTask, "save").resolves();

      const req = { params: { id }, body: { title: newTitle } };
      const res = {};
      res.status = sandbox.stub().returns(res);
      res.send = sandbox.stub().returns(res);
      await middlewares.handler(req, res);

      expect(mockTask.save).to.have.been.calledWithExactly();
      expect(res.status).to.have.been.calledWith(200);
      expect(res.send).to.have.been.calledWith({
        id,
        ...mockTaskData,
        title: newTitle,
      });
    });

    it("should respond with 200 when updating only the description", async () => {
      const id = "23bc329d-d437-4623-8d8c-d4c86a9f8a0a";
      const newDescription = "This is a sample task for testing";
      const mockTaskData = {
        id,
        title: "Pay bills",
        description: "Settle utility bills and other pending payments",
        isDone: false,
      };
      const mockTask = Task.createForTest(mockTaskData);
      sandbox.stub(Task, "findById").resolves(mockTask);
      sandbox.stub(mockTask, "save").resolves();

      const req = { params: { id }, body: { description: newDescription } };
      const res = {};
      res.status = sandbox.stub().returns(res);
      res.send = sandbox.stub().returns(res);
      await middlewares.handler(req, res);

      expect(mockTask.save).to.have.been.calledWithExactly();
      expect(res.status).to.have.been.calledWith(200);
      expect(res.send).to.have.been.calledWith({
        id,
        ...mockTaskData,
        description: newDescription,
      });
    });

    it("should respond with 200 when updating only the isDone", async () => {
      const id = "23bc329d-d437-4623-8d8c-d4c86a9f8a0a";
      const newIsDone = true;
      const mockTaskData = {
        id,
        title: "Pay bills",
        description: "Settle utility bills and other pending payments",
        isDone: false,
      };
      const mockTask = Task.createForTest(mockTaskData);
      sandbox.stub(Task, "findById").resolves(mockTask);
      sandbox.stub(mockTask, "save").resolves();

      const req = { params: { id }, body: { isDone: newIsDone } };
      const res = {};
      res.status = sandbox.stub().returns(res);
      res.send = sandbox.stub().returns(res);
      await middlewares.handler(req, res);

      expect(mockTask.save).to.have.been.calledWithExactly();
      expect(res.status).to.have.been.calledWith(200);
      expect(res.send).to.have.been.calledWith({
        id,
        ...mockTaskData,
        isDone: newIsDone,
      });
    });
  });
});
