// tests/crud_operations.js

import chai from "chai";
import chaiHttp from "chai-http";
import { app, server } from "../app.mjs";
import { seed_db } from "../util/seed_db.mjs";
import Job from "../models/Job.mjs";

chai.use(chaiHttp);
const expect = chai.expect;

describe("Testing Job CRUD Operations", function () {
  let csrfCookie;

  // Seed the database before tests
  before(async () => {
    await seed_db();
  });

  // Close the server after tests
  after(() => {
    server.close();
  });

  it("should get the index page", (done) => {
    chai
      .request(app)
      .get("/")
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.text).to.include("Jobs List");
        done();
      });
  });

  // Add more tests for other CRUD operations
  it("should create a new job", (done) => {
    chai
      .request(app)
      .get("/jobs/new")
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.text).to.include("Create a New Job");

        // Get the CSRF token from the cookie
        csrfCookie = res.header["set-cookie"].join().split(";")[0];

        done();
      });
  });
});
