// routes/sessionRoutes.mjs
import express from "express";
import passport from "passport";
import { csrfProtection, addCsrfToken } from "../middleware/csrf.mjs";
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
  .get(csrfProtection, addCsrfToken, registerShow) // GET request to show the registration form
  .post(csrfProtection, registerDo); // POST request to handle user registration

// Routes for user logon
router
  .route("/logon")
  .get(csrfProtection, addCsrfToken, logonShow) // GET request to show the logon form
  .post(
    csrfProtection,
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/sessions/logon",
      failureFlash: true,
    })
  ); // POST request to handle user logon

// Route for user logoff
router.route("/logoff").post(csrfProtection, logoff); // POST request to handle user logoff

export default router;
