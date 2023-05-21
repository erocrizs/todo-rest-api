const chai = require("chai");
const sinon = require("sinon");
const middlewares = require("@src/controller/task/create");
const Task = require("@src/model/task");
const { ValidationError } = require("express-validation");

const expect = chai.expect;

describe("Controller > Task > Create", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe(".validator", () => {
    it("should call next if there is no issue in with the body", async () => {
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

    it("should call next with an error if the title is missing", (done) => {
      const req = {
        body: {
          description: "This is a sample task for testing",
          isDone: false,
        },
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

    it("should call next with an error if title is not a string", (done) => {
      const req = {
        body: {
          title: 1001,
          description: "This is a sample task for testing",
          isDone: false,
        },
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

    it("should call next with an error if description is not a string", (done) => {
      const req = {
        body: {
          title: "Test task",
          description: 3.14,
          isDone: false,
        },
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

    it("should call next with an error if isDone is not a boolean", (done) => {
      const req = {
        body: {
          title: "Test task",
          description: "This is a sample task for testing",
          isDone: "maybe",
        },
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
    it("should respond with 200 and the JSON of the newly created task", async () => {
      const testTask = Task.create({
        title: "Test task",
        description: "This is a sample task for testing",
        isDone: false,
      });
      sandbox.stub(Task, "create").returns(testTask);
      sandbox.stub(testTask, "save").resolves();

      const req = {
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

      expect(Task.create).to.have.been.calledWithExactly({
        title: "Test task",
        description: "This is a sample task for testing",
        isDone: false,
      });
      expect(testTask.save).to.have.been.calledWithExactly();
      expect(res.status).to.have.been.calledWith(200);
      expect(res.send).to.have.been.calledWith(testTask.json());
    });

    it("should respond with 200 using default values", async () => {
      const testTask = Task.create({
        title: "Test task",
        description: "",
        isDone: false,
      });
      sandbox.stub(Task, "create").returns(testTask);
      sandbox.stub(testTask, "save").resolves();

      const req = {
        body: {
          title: "Test task",
        },
      };
      const res = {};
      res.status = sandbox.stub().returns(res);
      res.send = sandbox.stub().returns(res);
      await middlewares.handler(req, res);

      expect(Task.create).to.have.been.calledWithExactly({
        title: "Test task",
        description: "",
        isDone: false,
      });
      expect(testTask.save).to.have.been.calledWithExactly();
      expect(res.status).to.have.been.calledWith(200);
      expect(res.send).to.have.been.calledWith(testTask.json());
    });
  });
});
