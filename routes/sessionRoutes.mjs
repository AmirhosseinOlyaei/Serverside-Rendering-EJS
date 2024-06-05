// routes/sessionRoutes.mjs
// const express = require("express");
import express from "express";
// const passport = require("passport");
const router = express.Router();

// const {
//   logonShow,
//   registerShow,
//   registerDo,
//   logoff,
// } = require("../controllers/sessionController.mjs");
import {
  logonShow,
  registerShow,
  registerDo,
  logoff,
} from "../controllers/sessionController.mjs";

router.route("/register").get(registerShow).post(registerDo);
router
  .route("/logon")
  .get(logonShow)
  .post(
    // passport.authenticate("local", {
    //   successRedirect: "/",
    //   failureRedirect: "/sessions/logon",
    //   failureFlash: true,
    // })
    (req, res) => {
      res.send("Not yet implemented.");
    }
  );
router.route("/logoff").post(logoff);

export default router;
