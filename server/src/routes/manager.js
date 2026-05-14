const express = require("express");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { requireManager } = require("../middleware/auth");

const router = express.Router();

/* =========================
   GET ALL APPOINTMENTS (MANAGER)
========================= */
router.get("/appointments", requireManager, async (req, res) => {
  try {
    const appointments = await Appointment
      .find()
      .populate("patientId", "name")
      .populate("doctorId", "name");

    // ✅ IMPORTANT: wrap in { appointments }
    res.json({ appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load appointments" });
  }
});

/* =========================
   DELETE APPOINTMENT (MANAGER)
========================= */
router.delete("/appointments/:id", requireManager, async (req, res) => {
  try {
    const { id } = req.params;

    await Appointment.findByIdAndDelete(id);

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete appointment" });
  }
});

/* =========================
   GET ALL USERS (MANAGER)
========================= */
router.get("/users", requireManager, async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load users" });
  }
});

module.exports = router;
