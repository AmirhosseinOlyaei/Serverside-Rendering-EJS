// app.mjs
import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import "express-async-errors";
import connectMongoDBSession from "connect-mongodb-session";
import connectDB from "./db/connect.js";
import storeLocals from "./middleware/storeLocals.mjs";
import sessionRoutes from "./routes/sessionRoutes.mjs";
import dotenv from "dotenv";
import flash from "connect-flash";
import passport from "passport";
import passportInit from "./passport/passportInit.mjs";
import auth from "./middleware/auth.mjs";
import secretWordRouter from "./routes/secretWord.mjs";
import csrf from "host-csrf";
import cookieParser from "cookie-parser";
import jobsRouter from "./routes/jobs.mjs";
import helmet from "helmet";
import xss from "xss-clean";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Security middlewares
app.use(helmet());
app.use(xss());

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);

// Static files middleware
app.use(express.static(new URL("public", import.meta.url).pathname));

// Set view engine
app.set("view engine", "ejs");

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));

const MongoDBStore = connectMongoDBSession(session);
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "mySessions",
});

store.on("error", function (error) {
  console.error(error);
});

const sessionParams = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: {
    secure: app.get("env") === "production",
    sameSite: "strict",
    httpOnly: true,
  },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1);
  sessionParams.cookie.secure = true;
}

app.use(session(sessionParams));

app.use(flash());

passportInit();
app.use(passport.initialize());
app.use(passport.session());

app.use(storeLocals);

app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const token = csrf.token(req, res);
  res.cookie("csrf-token", token, {
    httpOnly: true,
    secure: app.get("env") === "production",
    sameSite: "Strict",
  });
  res.locals._csrf = token;
  next();
});

app.get("/multiply", (req, res) => {
  const first = parseFloat(req.query.first);
  const second = parseFloat(req.query.second);
  let result;

  if (isNaN(first) || isNaN(second)) {
    result = "NaN";
  } else if (first === null || second === null) {
    result = "null";
  } else {
    result = first * second;
  }

  res.json({ result });
});

// Middleware to set Content-Type header
app.use((req, res, next) => {
  if (req.path === "/multiply") {
    res.set("Content-Type", "application/json");
  } else {
    res.set("Content-Type", "text/html");
  }
  next();
});

app.use("/jobs", auth);
app.use("/jobs", jobsRouter);

app.get("/", (req, res) => {
  res.render("index");
});
app.use("/sessions", sessionRoutes);
app.use("/secretWord", auth, secretWordRouter);

app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    console.error("CSRF error:", err);
    req.flash("error", "Invalid CSRF token.");
    if (res.headersSent) {
      return next(err);
    } else {
      return res.redirect("back");
    }
  } else {
    next(err);
  }
});

app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message);
});

const port = process.env.PORT || 3000;

let mongoURL = process.env.MONGO_URI;
if (process.env.NODE_ENV === "test") {
  mongoURL = process.env.MONGO_URI_TEST;
}

const start = async () => {
  try {
    await connectDB(mongoURL);
    const server = app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
    return server;
  } catch (error) {
    console.error(error);
  }
};

const server = await start();

export { app, server };
