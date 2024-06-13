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

const app = express();

app.use(helmet());

app.use(xss());

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

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
app.use(storeLocals);

// CSRF protection middleware
const csrfOptions = {
  protected_operations: ["POST", "PUT", "DELETE", "PATCH"],
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
    const token = csrf.token(req, res);
    console.log("CSRF Token:", token);
    res.cookie("csrf-token", token, csrfOptions.cookieParams);
    next();
  },
};

// Apply CSRF protection middleware
const csrfMiddleware = csrf(csrfOptions);

app.use(csrfMiddleware);

// Require auth middleware for /jobs routes
app.use("/jobs", auth);

// Require jobs router
app.use("/jobs", jobsRouter);

// Routes
app.get("/", (req, res) => {
  res.render("index");
});
app.use("/sessions", sessionRoutes);

// Secret word handling
app.use("/secretWord", auth, secretWordRouter);

// Handle CSRF errors
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    console.log("CSRF error:", err);
    req.flash("error", "Invalid CSRF token.");
    // Check if headers have already been sent
    if (res.headersSent) {
      return next(err);
    } else {
      return res.redirect("back");
    }
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
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
