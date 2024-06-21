// util/seed_db.mjs
import { factory } from 'factory-girl';
import Job from '../models/Job.mjs';
import User from '../models/User.mjs';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

dotenv.config();

factory.define('job', Job, {
  company: () => faker.company.name(),
  position: () => faker.person.jobTitle(),
  status: () => ['interview', 'declined', 'pending'][Math.floor(3 * Math.random())],
  createdBy: () => factory.assoc('user', '_id'),
});

factory.define('user', User, {
  name: () => faker.person.fullName(),
  email: () => faker.internet.email(),
  password: () => faker.internet.password(),
});

const seed_db = async () => {
  try {
    await Job.deleteMany({});
    await User.deleteMany({});
    const testUserPassword = faker.internet.password();
    const testUser = await factory.create('user', { password: testUserPassword });
    await factory.createMany('job', 20);
    return testUser;
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

export { factory, seed_db };
