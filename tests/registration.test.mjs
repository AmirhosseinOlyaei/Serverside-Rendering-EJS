// tests/registration.test.mjs
import chai from "chai";
import chaiHttp from "chai-http";
import { app, server } from "../app.mjs";
import { factory, seed_db } from "../util/seed_db.mjs";
import { faker } from "@faker-js/faker";
import User from "../models/User.mjs";

chai.use(chaiHttp);
const expect = chai.expect;

describe("tests for registration and logon", function () {
  let csrfToken;
  let csrfCookie;

  // Seed the database before tests
  before(async () => {
    await seed_db();
  });

  // Close the server after tests
  after(() => {
    server.close();
  });

  it("should get the registration page", (done) => {
    chai
      .request(app)
      .get("/session/register")
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.text).to.include("Enter your name");

        const textNoLineEnd = res.text.replaceAll("\n", "");
        const csrfTokenMatch = /name="_csrf" value="(.*?)"/.exec(textNoLineEnd);
        expect(csrfTokenMatch).to.not.be.null;

        csrfToken = csrfTokenMatch[1];

        const cookies = res.headers["set-cookie"];
        const csrfCookieMatch = cookies.find((cookie) =>
          cookie.startsWith("csrfToken")
        );
        const cookieValue = /csrfToken=(.*?);/.exec(csrfCookieMatch);
        csrfCookie = cookieValue[1];
        done();
      });
  });

  it("should register the user", async () => {
    const password = faker.internet.password();
    const user = await factory.build("user", { password });

    const dataToPost = {
      name: user.name,
      email: user.email,
      password,
      password1: password,
      _csrf: csrfToken,
    };

    console.log("Data to post:", dataToPost);

    try {
      const res = await chai
        .request(app)
        .post("/session/register")
        .set("Cookie", `csrfToken=${csrfCookie}`)
        .send(dataToPost);

      console.log("Response status:", res.status);
      console.log("Response text:", res.text);
      console.log("Response body:", res.body);

      expect(res).to.have.status(200); // Expecting a success response here
      expect(res.text).to.include("Jobs List");

      const newUser = await User.findOne({ email: user.email });
      console.log("New user:", newUser);
      expect(newUser).to.not.be.null;
    } catch (err) {
      console.error("Error in test:", err);
      expect.fail(`Test failed with error: ${err.message}`);
    }
  });

  // Test for registration with an existing email
  it("should not register user with an existing email", async () => {
    const password = faker.internet.password();
    const existingUser = await factory.build("user", { password });

    const dataToPost = {
      name: existingUser.name,
      email: existingUser.email,
      password,
      password1: password,
      _csrf: csrfToken,
    };

    // First registration should succeed
    await chai
      .request(app)
      .post("/session/register")
      .set("Cookie", `csrfToken=${csrfCookie}`)
      .send(dataToPost);

    // Try to register again with the same email
    try {
      const res = await chai
        .request(app)
        .post("/session/register")
        .set("Cookie", `csrfToken=${csrfCookie}`)
        .send(dataToPost);

      expect(res).to.have.status(400); // Expecting a failure response
      expect(res.text).to.include("That email address is already registered.");
    } catch (err) {
      console.error("Error in test:", err);
      expect.fail(`Test failed with error: ${err.message}`);
    }
  });
});
