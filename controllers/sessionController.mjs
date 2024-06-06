// controllers/sessionController.mjs
// const User = require("../models/User");
// const User = import("../models/User");
// const parseVErr = require("../util/parseValidationErrs");
import User from "../models/User.mjs";
import parseVErr from "../util/parseValidationErrs.mjs";

const registerShow = (req, res) => {
  res.render("register");
};

const registerDo = async (req, res, next) => {
  if (req.body.password != req.body.password1) {
    req.flash("error", "The passwords entered do not match.");
    return res.render("register", { errors: flash("errors") });
  }
  try {
    await User.create(req.body);
    // await User;
  } catch (e) {
    if (e.constructor.name === "ValidationError") {
      parseVErr(e, req);
    } else if (e.name === "MongoServerError" && e.code === 11000) {
      req.flash("error", "That email address is already registered.");
    } else {
      return next(e);
    }
    return res.render("register", { errors: flash("errors") });
  }
  res.redirect("/");
};

const logoff = (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
};

const logonShow = (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }
  res.render("logon");
};

export { registerShow, registerDo, logoff, logonShow };
