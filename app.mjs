// app.mjs
// const express = require("express");
import express from "express";
// const session = require("express-session");
import session from "express-session";
// const bodyParser = require("body-parser");
import bodyParser from "body-parser";
// require("express-async-errors");
import "express-async-errors";
// const MongoDBStore = require("connect-mongodb-session")(session);
import connectMongoDBSession from "connect-mongodb-session";
import connectDB from "./db/connect.js";
import storeLocals from "./middleware/storeLocals.mjs";
import sessionRoutes from "./routes/sessionRoutes.mjs";
// require("dotenv").config(); // Load environment variables from .env file
import "dotenv/config";
// app.use(require("connect-flash")());
import flash from "connect-flash";
import passport from "passport";
import passportInit from "./passport/passportInit.mjs";
import auth from "./middleware/auth.mjs";
import secretWordRouter from "./routes/secretWord.mjs";
// import hostCsrf from "host-csrf";
import csrf from "host-csrf";
import cookieParser from "cookie-parser";

const app = express();

// Setting view engine
app.set("view engine", "ejs");

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // To handle JSON requests

// Middleware for parsing cookies
app.use(cookieParser(process.env.SESSION_SECRET));

const MongoDBStore = connectMongoDBSession(session);
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "mySessions",
});

// Handle MongoDB session store errors
store.on("error", function (error) {
  console.log(error);
});

// Session parameters configuration
const sessionParams = {
  secret: process.env.SESSION_SECRET,
  resave: false, // Set to false unless you need to resave session
  saveUninitialized: false, // Set to false unless you need to save uninitialized session
  store: store,
  cookie: { secure: false, sameSite: "strict", httpOnly: true },
};

// Session cookie security for production
if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionParams.cookie.secure = true; // serve secure cookies
}

// Use session middleware
app.use(session(sessionParams));

// Flash messaging setup
app.use(flash());

// Initialize passport
passportInit();
app.use(passport.initialize());
app.use(passport.session());

// Use middleware to store local variables
// app.use(require("./middleware/storeLocals.mjs"));
app.use(storeLocals); // Middleware to store local variables

// CSRF protection middleware
const csrfOptions = {
  protected_operations: ["POST", "PUT", "DELETE", "PATCH"], // operations to protect
  protected_content_types: [
    "application/x-www-form-urlencoded",
    "text/plain",
    "multipart/form-data",
  ],
  development_mode: app.get("env") !== "production",
  cookieParams: {
    httpOnly: true,
    secure: app.get("env") === "production",
    sameSite: "Strict",
  },
  middleware: (req, res, next) => {
    // const token = req.csrfToken();
    const token = csrf.token(req, res);
    console.log("CSRF Token:", token); // Add this line
    res.cookie("csrf-token", token, csrfOptions.cookieParams);
    next();
  },
};

// Apply CSRF protection middleware
const csrfMiddleware = csrf(csrfOptions);
// Use CSRF middleware after cookie parser and body parser but before routes
app.use(csrfMiddleware);

// Routes
app.get("/", (req, res) => {
  res.render("index");
});
// app.use("/sessions", require("./routes/sessionRoutes.mjs"));
app.use("/sessions", sessionRoutes);

// Secret word handling
app.use("/secretWord", auth, secretWordRouter);

// Handle CSRF errors
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    console.log("CSRF error:", err);
    req.flash("error", "Invalid CSRF token.");
    res.redirect("back");
  } else {
    next(err);
    res.status(500).send(err.message);
  }
});

app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  console.log(err);
});

export default app;

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    // await require("./db/connect")(process.env.MONGO_URI);
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
