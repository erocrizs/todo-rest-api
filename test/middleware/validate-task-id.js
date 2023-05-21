const chai = require("chai");
const sinon = require("sinon");
const validateTaskId = require("@src/middleware/validate-task-id");
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

  describe(".handler", () => {
    it("should call next if there is an id param that is also a valid UUID", async () => {
      const req = {
        params: {
          id: "23bc329d-d437-4623-8d8c-d4c86a9f8a0a",
        },
      };
      const res = {};
      const next = sandbox.stub();
      await validateTaskId(req, res, next);
      expect(next).to.have.been.calledWithExactly();
    });

    it("should call next with an error if there is no id param", (done) => {
      const req = { params: {} };
      const res = {};
      validateTaskId(req, res, (err) => {
        try {
          expect(err).instanceOf(ValidationError);
          expect(err.statusCode).to.be.equal(400);
          done();
        } catch (testFail) {
          done(testFail);
        }
      });
    });

    it("should call next with an error if the id param is not a valid UUID", (done) => {
      const req = {
        params: {
          id: "invalid-uuid",
        },
      };
      const res = {};
      validateTaskId(req, res, (err) => {
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
});
