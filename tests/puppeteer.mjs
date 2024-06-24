// import puppeteer from "puppeteer";
// import { server } from "../app.mjs";
// import waitOn from "wait-on";
// import { promisify } from "util";

// const sleep = promisify(setTimeout);

// let browser;

// describe("index page test", function () {
//   this.timeout(30000); // Increase timeout for the test suite

//   before(async function () {
//     console.log("Starting Puppeteer...");
//     browser = await puppeteer.launch({ headless: true, slowMo: 100 });

//     // Use wait-on to wait for the server to be ready
//     console.log("Waiting for server to be ready...");

//     try {
//       await waitOn({
//         resources: ["http://localhost:3000"],
//         timeout: 30000, // 15 seconds timeout
//         interval: 1000, // Poll every second
//         log: true,
//         // Adjust the following check for your environment
//         validateStatus: function (status) {
//           return status >= 200 && status < 300; // Validate only 2xx status codes
//         },
//       });
//       console.log("Server is ready.");
//     } catch (error) {
//       console.error("Error waiting for the server:", error);
//       throw error;
//     }

//     console.log("Navigating to http://localhost:3000...");
//     const page = await browser.newPage();

//     try {
//       await page.goto("http://localhost:3000", {
//         waitUntil: "networkidle2",
//         timeout: 10000,
//       });
//       console.log("Successfully navigated to the page.");
//     } catch (error) {
//       console.error("Error navigating to the page:", error);
//       throw error;
//     }
//   });

//   after(async function () {
//     console.log("Closing browser...");
//     await browser.close();
//     console.log("Stopping server...");
//     server.close(() => {
//       console.log("Server stopped.");
//     });
//   });

//   it("should have completed a connection", function (done) {
//     done();
//   });
// });
