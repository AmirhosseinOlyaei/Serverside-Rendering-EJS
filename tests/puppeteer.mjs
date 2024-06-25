// tests/puppeteer.mjs
import puppeteer from "puppeteer";
import { expect } from "chai";
import { seed_db, testUserPassword } from "../util/seed_db.mjs";
import Job from "../models/Job.mjs";

let testUser = null;
let page = null;
let browser = null;

describe("jobs-ejs puppeteer test", function () {
  before(async function () {
    this.timeout(10000);
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto("http://localhost:3000");
  });

  after(async function () {
    this.timeout(5000);
    await browser.close();
  });

  describe("index page test", function () {
    this.timeout(10000);

    it("finds the index page logon link", async () => {
      const logonLink = await page.waitForSelector(
        'a ::-p-text("Click this link to logon")'
      );
      expect(logonLink).to.exist;
    });

    it("gets to the logon page", async () => {
      const logonLink = await page.waitForSelector(
        'a ::-p-text("Click this link to logon")'
      );
      await logonLink.click();
      await page.waitForNavigation();
      const email = await page.waitForSelector('input[name="email"]');
      expect(email).to.exist;
    });
  });

  describe("logon page test", function () {
    this.timeout(20000);

    it("resolves all the fields", async () => {
      const email = await page.waitForSelector('input[name="email"]');
      const password = await page.waitForSelector('input[name="password"]');
      const submit = await page.waitForSelector('button ::-p-text("Logon")');
      expect(email).to.exist;
      expect(password).to.exist;
      expect(submit).to.exist;
    });

    // it("sends the logon", async () => {
    //   testUser = await seed_db();
    //   await page.type('input[name="email"]', testUser.email);
    //   await page.type('input[name="password"]', testUserPassword);
    //   await page.click('button ::-p-text("Logon")');
    //   await page.waitForNavigation();
    //   await page.waitForSelector(
    //     `p ::-p-text("${testUser.name} is logged on.")`
    //   );
    //   await page.waitForSelector('a ::-p-text("change the secret")');
    //   await page.waitForSelector('a[href="/secretWord"]');
    //   const copyr = await page.waitForSelector('p ::-p-text("copyright")');
    //   const copyrText = await page.evaluate((el) => el.textContent, copyr);
    //   console.log("copyright text: ", copyrText);
    // });
  });

  //   describe("puppeteer job operations", function () {
  //     this.timeout(60000);
  //     it("gets the jobs page", async () => {
  //       this.timeout(30000);
  //       const jobsLink = await page.waitForSelector(
  //         'a ::-p-text("see job listings")'
  //       );
  //       await jobsLink.click();
  //       await page.waitForNavigation();
  //       const pageContent = await page.content();
  //       const pageSplit = pageContent.split("<tr>");
  //       expect(pageSplit.length).to.equal(21);
  //     });

  //     it("gets the add job form", async () => {
  //       this.timeout(30000);
  //       const newJobLink = await page.waitForSelector('a ::-p-text("Add A Job")');
  //       await newJobLink.click();
  //       await page.waitForNavigation();
  //       const companyField = await page.waitForSelector('input[name="company"]');
  //       const positionField = await page.waitForSelector(
  //         'input[name="position"]'
  //       );
  //       const submitJob = await page.waitForSelector('button ::-p-text("add")');
  //       expect(companyField).to.exist;
  //       expect(positionField).to.exist;
  //       expect(submitJob).to.exist;
  //     });

  //     it("adds the new job", async () => {
  //       await page.type('input[name="company"]', "Acme");
  //       await page.type('input[name="position"]', "flunky");
  //       await page.click('button ::-p-text("add")');
  //       await page.waitForNavigation();
  //       const pageContent = await page.content();
  //       const pageSplit = pageContent.split("<tr>");
  //       expect(pageSplit.length).to.equal(22);
  //       expect(pageContent).to.contain("The job entry was created");
  //       const jobs = await Job.find({});
  //       expect(jobs.length).to.equal(1); // Assuming only one job is added for simplicity
  //     });
  //   });
});
