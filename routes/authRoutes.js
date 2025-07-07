const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Start Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback from Google
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}` }),
  (req, res) => {
    // Create JWT token
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    // Redirect with token to the frontend root URL
    res.redirect(`${process.env.CLIENT_URL}/?token=${token}`);
  }
);

// Logout
router.get("/logout", (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).send("Error logging out");
    res.send("Logged out");
  });
});

module.exports = router;
