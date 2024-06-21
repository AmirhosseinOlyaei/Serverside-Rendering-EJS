// tests/registration.test.mjs
import chai from "chai";
import chaiHttp from "chai-http";
import { app, server } from "../app.mjs";
import { factory, seed_db } from "../util/seed_db.mjs";
import * as faker from "@faker-js/faker";
import User from "../models/User.mjs";

chai.use(chaiHttp);
const expect = chai.expect;

describe("tests for registration and logon", function () {
  let csrfToken;
  let csrfCookie;

  after(() => {
    server.close();
  });

  it("should get the registration page", (done) => {
    chai
      .request(app)
      .get("/session/register")
      .send()
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res).to.have.status(200);
        expect(res).to.have.property("text");
        expect(res.text).to.include("Enter your name");
        const textNoLineEnd = res.text.replaceAll("\n", "");
        const csrfTokenMatch = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd);
        expect(csrfTokenMatch).to.not.be.null;
        csrfToken = csrfTokenMatch[1];
        expect(res).to.have.property("headers");
        expect(res.headers).to.have.property("set-cookie");
        const cookies = res.headers["set-cookie"];
        const csrfCookieMatch = cookies.find((element) =>
          element.startsWith("csrfToken")
        );
        expect(csrfCookieMatch).to.not.be.undefined;
        const cookieValue = /csrfToken=(.*?);\s/.exec(csrfCookieMatch);
        csrfCookie = cookieValue[1];
        done();
      });
  });

  it("should register the user", async () => {
    const password = faker.internet.password();
    console.log("Generated password:", password);

    try {
      const user = await factory.build("user", { password });
      console.log("Built user:", user);

      if (!user) {
        throw new Error("User not created by factory");
      }

      const dataToPost = {
        name: user.name,
        email: user.email,
        password,
        password1: password,
        _csrf: csrfToken,
      };

      console.log("Data to post:", dataToPost);

      const request = chai
        .request(app)
        .post("/session/register")
        .set("Cookie", `csrfToken=${csrfCookie}`)
        .set("content-type", "application/x-www-form-urlencoded")
        .send(dataToPost);
      const res = await request;

      expect(res).to.have.status(200);
      expect(res).to.have.property("text");
      expect(res.text).to.include("Jobs List");

      const newUser = await User.findOne({ email: user.email });
      expect(newUser).to.not.be.null;
      console.log("New user:", newUser);
    } catch (err) {
      console.error("Error in test:", err);
      expect.fail(err.message);
    }
  });
});
