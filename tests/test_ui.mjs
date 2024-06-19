// tests/test_ui.mjs
import * as chai from "chai";
import chaiHttp from "chai-http";
import { app, server } from "../app.mjs";

const { expect } = chai;

// Use chaiHttp
chai.default.use(chaiHttp);

describe("test getting a page", function () {
  // Close server after tests
  after(() => {
    server.close();
  });

  // Test case for index page
  it("should get the index page", (done) => {
    chai.default
      .request(app)
      .get("/")
      .end((err, res) => {
        expect(err).to.be.null; // Expect no errors
        expect(res).to.have.status(200); // Expect status 200
        expect(res).to.have.property("text"); // Expect text property
        expect(res.text).to.include("Click this link"); // Check for specific content
        done(); // Complete the test
      });
  });
});
