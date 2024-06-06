// app.mjs
// const express = require("express");
import express from "express";
// require("express-async-errors");
import "express-async-errors";
// const session = require("express-session");
import session from "express-session";
// const bodyParser = require("body-parser");
import bodyParser from "body-parser";
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

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const url = process.env.MONGO_URI;

const MongoDBStore = connectMongoDBSession(session);
const store = new MongoDBStore({
  uri: url,
  collection: "mySessions",
});
store.on("error", function (error) {
  console.log(error);
});

const sessionParams = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionParams.cookie.secure = true; // serve secure cookies
}

app.use(session(sessionParams));

// Flash messaging setup
app.use(flash());
// app.use(require("./middleware/storeLocals.mjs"));
app.use(storeLocals);

// Initialize passport
passportInit();
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.render("index");
});
// app.use("/sessions", require("./routes/sessionRoutes.mjs"));
app.use("/sessions", sessionRoutes);

// Secret word handling
app.use("/secretWord", auth, secretWordRouter);

app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  console.log(err);
});

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
