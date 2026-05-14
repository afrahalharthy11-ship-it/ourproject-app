const express = require('express');
const { body, param } = require('express-validator');
const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');
const { requireDoctor } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Helper: get or create availability doc for the logged-in doctor
const getOrCreateAvailability = async (doctorId) => {
  let availability = await Availability.findOne({ doctorId });
  if (!availability) {
    availability = await Availability.create({ doctorId, recurringSlots: [], specificSlots: [] });
  }
  return availability;
};

// GET /api/doctor/availability
router.get('/availability', requireDoctor, async (req, res) => {
  try {
    const availability = await getOrCreateAvailability(req.session.userId);
    res.json({ availability });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/doctor/availability/specific
router.post(
  '/availability/specific',
  requireDoctor,
  [
    body('date').isISO8601().withMessage('date must be a valid date (YYYY-MM-DD)'),
    body('startTime')
      .matches(/^\d{2}:\d{2}$/)
      .withMessage('startTime must be in HH:MM format'),
    body('endTime')
      .matches(/^\d{2}:\d{2}$/)
      .withMessage('endTime must be in HH:MM format'),
    body('duration')
      .isInt({ min: 1 })
      .withMessage('duration must be a positive integer (minutes)'),
  ],
  validate,
  async (req, res) => {
    try {
      const { date, startTime, endTime, duration } = req.body;
      const availability = await getOrCreateAvailability(req.session.userId);

      availability.specificSlots.push({
        date: new Date(date),
        startTime,
        endTime,
        duration,
      });
      await availability.save();

      res.status(201).json({
        message: 'Specific slot added',
        slot: availability.specificSlots[availability.specificSlots.length - 1],
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// DELETE /api/doctor/availability/specific/:slotId
router.delete(
  '/availability/specific/:slotId',
  requireDoctor,
  [param('slotId').isMongoId().withMessage('Invalid slot ID')],
  validate,
  async (req, res) => {
    try {
      const availability = await Availability.findOne({ doctorId: req.session.userId });
      if (!availability) {
        return res.status(404).json({ message: 'Availability not found' });
      }

      const slotIndex = availability.specificSlots.findIndex(
        (s) => s._id.toString() === req.params.slotId
      );
      if (slotIndex === -1) {
        return res.status(404).json({ message: 'Slot not found' });
      }

      availability.specificSlots.splice(slotIndex, 1);
      await availability.save();

      res.json({ message: 'Specific slot removed' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// GET /api/doctor/appointments
router.get('/appointments', requireDoctor, async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.session.userId })
      .populate('patientId', 'name email')
      .sort({ date: 1, startTime: 1 });

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
