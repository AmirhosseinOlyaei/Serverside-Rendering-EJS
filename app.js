// app.js
const express = require("express");
require("express-async-errors");
require("dotenv").config(); // Load environment variables from .env file
const session = require("express-session");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Use the session secret from the environment variables
    resave: false,
    saveUninitialized: true,
  })
);

// Secret word handling
let secretWord = "syzygy";
app.get("/secretWord", (req, res) => {
  res.render("secretWord", { secretWord });
});
app.post("/secretWord", (req, res) => {
  secretWord = req.body.secretWord;
  res.redirect("/secretWord");
});

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
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
