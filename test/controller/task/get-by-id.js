const chai = require("chai");
const sinon = require("sinon");
const middlewares = require("@src/controller/task/get-by-id");
const Task = require("@src/model/task");

const expect = chai.expect;

describe("Controller > Task > Get By ID", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe(".handler", () => {
    it("should respond with 200 and a JSON object of the found task", async () => {
      const id = "23bc329d-d437-4623-8d8c-d4c86a9f8a0a";
      const mockTaskJson = {
        id,
        title: "Pay bills",
        description: "Settle utility bills and other pending payments",
        isDone: false,
      };
      const mockTask = { json: sandbox.stub().returns(mockTaskJson) };
      sandbox.stub(Task, "findById").resolves(mockTask);
      const req = { params: { id } };
      const res = {};
      res.status = sandbox.stub().returns(res);
      res.send = sandbox.stub().returns(res);
      await middlewares.handler(req, res);

      expect(res.status).to.have.been.calledWith(200);
      expect(res.send).to.have.been.calledWith(mockTaskJson);
    });
    
    it("should respond with 404 and an error message if the task cannot be found", async () => {
      const id = "23bc329d-d437-4623-8d8c-d4c86a9f8a0a";
      sandbox.stub(Task, "findById").resolves(null);
      const req = { params: { id } };
      const res = {};
      res.status = sandbox.stub().returns(res);
      res.send = sandbox.stub().returns(res);
      await middlewares.handler(req, res);

      expect(res.status).to.have.been.calledWith(404);
      expect(res.send).to.have.been.calledWith({ error: "Not found" });
    });
  });
});
