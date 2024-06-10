// routes/secretWord.mjs
import express from "express";

const router = express.Router();

// GET route to display the secret word
router.get("/", (req, res) => {
  if (!req.session.secretWord) {
    req.session.secretWord = "syzygy";
  }
  res.render("secretWord", { secretWord: req.session.secretWord });
});

// POST route to update the secret word
router.post("/", (req, res) => {
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
