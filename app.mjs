// app.mjs
import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import "express-async-errors";
import connectMongoDBSession from "connect-mongodb-session";
import connectDB from "./db/connect.js";
import storeLocals from "./middleware/storeLocals.mjs";
import sessionRoutes from "./routes/sessionRoutes.mjs";
import "dotenv/config";
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
app.use(express.static(path.join(__dirname, "public")));

// Set view engine
app.set("view engine", "ejs");

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json()); // To handle JSON requests

const MongoDBStore = connectMongoDBSession(session);
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "mySessions",
});

// Handle MongoDB session store errors
store.on("error", function (error) {
  console.error(error);
});

// Session parameters configuration
const sessionParams = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: {
    secure: app.get("env") === "production", // secure in production
    sameSite: "strict",
    httpOnly: true,
  },
};

// Trust proxy for secure cookies in production
if (app.get("env") === "production") {
  app.set("trust proxy", 1);
  sessionParams.cookie.secure = true;
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
app.use(storeLocals);

// Middleware for parsing cookies
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.urlencoded({ extended: false }));

// Simplified CSRF protection middleware for debugging
app.use((req, res, next) => {
  const token = csrf.token(req, res);
  console.log("Generated CSRF Token:", token);
  res.cookie("csrf-token", token, {
    httpOnly: true,
    secure: app.get("env") === "production",
    sameSite: "Strict",
  });
  res.locals._csrf = token;
  next();
});

// Routes and middleware setup
app.use("/jobs", auth); // Require auth middleware for /jobs routes
app.use("/jobs", jobsRouter); // Require jobs router

// Define routes
app.get("/", (req, res) => {
  res.render("index");
});
app.use("/sessions", sessionRoutes);
app.use("/secretWord", auth, secretWordRouter);

// Handle CSRF errors
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

// Handle 404 errors
app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

// Handle other errors
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message);
});

// Start the server
export default app;

const port = process.env.PORT || 3000;

let mongoURL = process.env.MONGO_URI;
if (process.env.NODE_ENV === "test") {
  mongoURL = process.env.MONGO_URI_TEST;
}

const start = async () => {
  try {
    await connectDB(mongoURL);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.error(error);
  }
};

start();
