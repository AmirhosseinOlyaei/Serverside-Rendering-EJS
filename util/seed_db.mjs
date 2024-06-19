// util/seed_db.mjs
import Job from "../models/Job.js";
import User from "../models/User.js";
import { fakerEN_US as faker } from "@faker-js/faker";
import { factory } from "factory-bot";
import { MongooseAdapter } from "factory-bot/dist/adapters/mongoose";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const testUserPassword = faker.internet.password();
const factoryAdapter = new MongooseAdapter();
factory.setAdapter(factoryAdapter);
factory.define("job", Job, {
  company: () => faker.company.name(),
  position: () => faker.person.jobTitle(),
  status: () =>
    ["interview", "declined", "pending"][Math.floor(3 * Math.random())], // random one of these
});
factory.define("user", User, {
  name: () => faker.person.fullName(),
  email: () => faker.internet.email(),
  password: () => faker.internet.password(),
});

const seed_db = async () => {
  let testUser = null;
  try {
    const mongoURL = process.env.MONGO_URI_TEST;
    await Job.deleteMany({}); // deletes all job records
    await User.deleteMany({}); // and all the users
    testUser = await factory.create("user", { password: testUserPassword });
    await factory.createMany("job", 20, { createdBy: testUser._id }); // put 30 job entries in the database.
  } catch (e) {
    console.log("database error");
    console.log(e.message);
    throw e;
  }
  return testUser;
};

export { testUserPassword, factory, seed_db };
