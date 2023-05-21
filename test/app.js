const chai = require("chai");
const app = require("@src/app");

const expect = chai.expect;

describe("App", () => {
  let server;

  before(() => {
    server = app.listen();
  });

  after(() => {
    server.close();
  });

  it("should respond with success: true when accessing /test", (done) => {
    chai
      .request(app)
      .get("/ping")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({ pong: true });
        done();
      });
  });
});
