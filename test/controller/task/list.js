const chai = require("chai");
const sinon = require("sinon");
const middlewares = require("@src/controller/task/list");
const Task = require("@src/model/task");
const { ValidationError } = require("express-validation");

const expect = chai.expect;

describe("Controller > Task > List", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe(".validator", () => {
    it("should call next if there is no issue in with the query", async () => {
      const req = {
        query: {
          filter: {
            title: "title",
            description: "desc",
            isDone: "true",
          },
          page: "5",
          count: "5",
        },
      };
      const res = {};
      const next = sandbox.stub();
      await middlewares.validator(req, res, next);
      expect(next).to.have.been.calledWithExactly();
    });

    it("should call next with an error if the filter is invalid", (done) => {
      const req = {
        query: {
          filter: "invalid-filter",
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

    it("should call next with an error if the isDone filter is invalid", (done) => {
      const req = {
        query: {
          filter: {
            isDone: "neither-true-or-false",
          },
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

    it("should call next with an error if the page is invalid", (done) => {
      const req = {
        query: {
          page: "-1",
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

    it("should call next with an error if the count is invalid", (done) => {
      const req = {
        query: {
          count: "2.4",
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
    const mockData = [
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

    let mockTaskList;

    beforeEach(() => {
      mockTaskList = mockData.map((t) => ({ json: sandbox.stub().returns(t) }));
    });

    it("should respond with 200 and a list of tasks with the default filter, page, and count values", async () => {
      sandbox.stub(Task, "list").resolves(mockTaskList);
      const req = { query: {} };
      const res = {};
      res.status = sandbox.stub().returns(res);
      res.send = sandbox.stub().returns(res);
      await middlewares.handler(req, res);

      expect(Task.list).to.have.been.calledWith({
        page: 0,
        count: 5,
        filter: {},
      });
      expect(res.status).to.have.been.calledWith(200);
      expect(res.send).to.have.been.calledWith({
        page: 1,
        count: 5,
        data: mockData,
      });
    });

    it("should respond with 200 and a list of tasks with the provided filter, page, and count values", async () => {
      sandbox.stub(Task, "list").resolves(mockTaskList);
      const req = {
        query: {
          filter: {
            title: "title",
            description: "desc",
            isDone: "true",
          },
          page: "5",
          count: "5",
        },
      };
      const res = {};
      res.status = sandbox.stub().returns(res);
      res.send = sandbox.stub().returns(res);
      await middlewares.handler(req, res);

      expect(Task.list).to.have.been.calledWith({
        page: 4,
        count: 5,
        filter: {
          title: "title",
          description: "desc",
          isDone: true,
        },
      });
      expect(res.status).to.have.been.calledWith(200);
      expect(res.send).to.have.been.calledWith({
        page: 5,
        count: 5,
        data: mockData,
      });
    });
  });
});
