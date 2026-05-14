const express = require("express");
const { body } = require("express-validator");
const User = require("../models/User");
const { requireLogin } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

/* =========================
   REGISTER
========================= */
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email")
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn(["patient", "doctor"])
      .withMessage("Role must be patient or doctor"),
    body("specialty")
      .if(body("role").equals("doctor"))
      .trim()
      .notEmpty()
      .withMessage("Specialty is required for doctors"),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, email, password, role, specialty } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const user = new User({ name, email, password, role });

      if (role === "doctor" && specialty) {
        user.specialty = specialty;
      }

      await user.save();

      req.session.userId = user._id.toString();
      req.session.role = user.role;

      req.session.save((sessionErr) => {
        if (sessionErr) {
          return res.status(500).json({ message: "Failed to create session" });
        }

        res.status(201).json({
          message: "Registered successfully",
          user: user.toSafeObject(),
        });
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/* =========================
   LOGIN (NORMAL)
========================= */
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const match = await user.comparePassword(password);
      if (!match) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user._id.toString();
      req.session.role = user.role;

      req.session.save((sessionErr) => {
        if (sessionErr) {
          return res.status(500).json({ message: "Failed to create session" });
        }

        res.json({
          message: "Logged in successfully",
          user: user.toSafeObject(),
        });
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/* =========================
   LOGOUT
========================= */
router.post("/logout", requireLogin, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not log out" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

/* =========================
   CURRENT USER
========================= */
router.get("/me", requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;