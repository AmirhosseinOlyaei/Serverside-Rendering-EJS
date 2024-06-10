// routes/secretWord.mjs
import express from "express";
import { csrfProtection, addCsrfToken } from "../middleware/csrf.mjs";

const router = express.Router();

// GET route to display the secret word
router.get("/", csrfProtection, addCsrfToken, (req, res) => {
  if (!req.session.secretWord) {
    req.session.secretWord = "syzygy";
  }
  res.render("secretWord", { secretWord: req.session.secretWord });
});

// POST route to update the secret word
router.post("/", csrfProtection, (req, res) => {
  const { secretWord } = req.body;
  if (secretWord.toUpperCase()[0] === "P") {
    req.flash("error", "That word won't work!");
    req.flash("error", "You can't use words that start with 'P'.");
  } else {
    req.session.secretWord = secretWord;
    req.flash("info", "The secret word was changed.");
  }
  res.redirect("/secretWord");
});

export default router;
