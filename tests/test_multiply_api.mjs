// tests/test_multiply_api.mjs
import * as chai from "chai";
import chaiHttp from "chai-http";
import { app, server } from "../app.mjs";

const { expect } = chai;

chai.default.use(chaiHttp);

describe("test multiply api", function () {
  after(() => {
    server.close();
  });

  it("should multiply two numbers", (done) => {
    chai.default
      .request(app)
      .get("/multiply")
      .query({ first: 7, second: 6 })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.have.property("body");
        expect(res.body).to.have.property("result");
        expect(res.body.result).to.equal(42);
        done();
      });
  });
});
