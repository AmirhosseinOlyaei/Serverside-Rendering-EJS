// routes/sessionRoutes.mjs
import express from "express";
import passport from "passport";
import {
  logonShow,
  registerShow,
  registerDo,
  logoff,
} from "../controllers/sessionController.mjs";

const router = express.Router();

// Routes for user registration
router
  .route("/register")
  .get(registerShow) // GET request to show the registration form
  .post(registerDo); // POST request to handle user registration

// Routes for user logon
router
  .route("/logon")
  .get(logonShow) // GET request to show the logon form
  .post(
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/sessions/logon",
      failureFlash: true,
    }),
    (req, res) => {
      // CSRF token refresh
      csrf.refresh(req, res); // Refresh CSRF token
      // Redirect to the success route
      res.redirect("/");
    }
  ); // POST request to handle user logon

// Route for user logoff
router.route("/logoff").post(logoff); // POST request to handle user logoff

export default router;
