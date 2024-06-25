// controllers/sessionController.mjs
import User from "../models/User.mjs";
import parseVErr from "../util/parseValidationErrs.mjs";

// Display registration page
const registerShow = (req, res) => {
  res.render("register");
};

// Handle user registration
const registerDo = async (req, res, next) => {
  // Check if passwords match
  if (req.body.password !== req.body.password1) {
    req.flash("error", "The passwords entered do not match.");
    return res.status(400).render("register", { errors: req.flash("error") });
  }

  try {
    // Attempt to create the user
    await User.create(req.body);
  } catch (e) {
    // Handle validation errors
    if (e.constructor.name === "ValidationError") {
      parseVErr(e, req);
    }
    // Handle duplicate key errors (e.g., email already exists)
    else if (e.name === "MongoServerError" && e.code === 11000) {
      req.flash("error", "That email address is already registered.");
    }
    // Handle unexpected errors
    else {
      return next(e);
    }

    // Respond with status 400 for bad request
    return res.status(400).render("register", { errors: req.flash("error") });
  }

  // Redirect to homepage upon successful registration
  res.redirect("/");
};

// Logoff user and destroy session
const logoff = (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
};

// Display logon page
const logonShow = (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }
  res.render("logon");
};

export { registerShow, registerDo, logoff, logonShow };
