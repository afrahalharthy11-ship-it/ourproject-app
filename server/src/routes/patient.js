const express = require('express');
const { body, param, query } = require('express-validator');
const User = require('../models/User');
const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');
const { requirePatient } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// --- Availability Computation Logic ---
//
// Given a doctor's availability document and their booked appointments on a specific date,
// compute the list of open slots:
//   1. Start with recurring slots for the queried day-of-week
//   2. Add specific slots for the exact date
//   3. Remove any slot whose startTime matches an existing (non-cancelled) appointment
//
const computeAvailableSlots = (availability, bookedAppointments, queryDate) => {
  const date = new Date(queryDate);
  const dayOfWeek = date.getDay();

  // Normalize date to midnight for comparison
  const dateStr = date.toISOString().split('T')[0];

  // Step 1: Recurring slots for this day of week
  const recurringForDay = availability.recurringSlots
    .filter((s) => s.dayOfWeek === dayOfWeek)
    .map((s) => ({
      startTime: s.startTime,
      endTime: s.endTime,
      duration: s.duration,
      type: 'recurring',
    }));

  // Step 2: Specific slots for this exact date
  const addedSpecific = availability.specificSlots
    .filter((s) => {
      const slotDateStr = new Date(s.date).toISOString().split('T')[0];
      return slotDateStr === dateStr;
    })
    .map((s) => ({
      startTime: s.startTime,
      endTime: s.endTime,
      duration: s.duration,
      type: 'specific',
    }));

  // Combine recurring + specific
  const allSlots = [...recurringForDay, ...addedSpecific];

  // Step 3: Remove booked appointment times
  const bookedStartTimes = new Set(
    bookedAppointments
      .filter((a) => a.status !== 'cancelled')
      .map((a) => a.startTime)
  );

  const availableSlots = allSlots.filter((s) => !bookedStartTimes.has(s.startTime));

  return availableSlots;
};

// GET /api/patient/doctors
router.get('/doctors', requirePatient, async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/patient/doctors/:doctorId/dates
// Returns all upcoming specific-date slots (non-blocked) grouped by date,
// with pre-computed available time slots for each date.
router.get(
  '/doctors/:doctorId/dates',
  requirePatient,
  [param('doctorId').isMongoId().withMessage('Invalid doctor ID')],
  validate,
  async (req, res) => {
    try {
      const { doctorId } = req.params;

      const doctor = await User.findOne({ _id: doctorId, role: 'doctor' }).select('-password');
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }

      const availability = await Availability.findOne({ doctorId });
      if (!availability || !availability.specificSlots.length) {
        return res.json({ doctor, dates: [] });
      }

      const todayStr = new Date().toISOString().split('T')[0];

      // Collect unique upcoming dates from specific slots
      const dateSet = new Set();
      availability.specificSlots.forEach((s) => {
        const slotDateStr = new Date(s.date).toISOString().split('T')[0];
        if (slotDateStr >= todayStr) {
          dateSet.add(slotDateStr);
        }
      });

      const sortedDates = Array.from(dateSet).sort();

      // For each date compute available slots (accounting for bookings)
      const results = await Promise.all(
        sortedDates.map(async (dateStr) => {
          const startOfDay = new Date(dateStr);
          startOfDay.setUTCHours(0, 0, 0, 0);
          const endOfDay = new Date(dateStr);
          endOfDay.setUTCHours(23, 59, 59, 999);

          const bookedAppointments = await Appointment.find({
            doctorId,
            date: { $gte: startOfDay, $lte: endOfDay },
            status: { $ne: 'cancelled' },
          });

          const slots = computeAvailableSlots(availability, bookedAppointments, dateStr);
          return { date: dateStr, slots };
        })
      );

      // Only return dates that actually have open slots
      const datesWithSlots = results.filter((r) => r.slots.length > 0);

      res.json({ doctor, dates: datesWithSlots });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// GET /api/patient/doctors/:doctorId/availability?date=YYYY-MM-DD
router.get(
  '/doctors/:doctorId/availability',
  requirePatient,
  [
    param('doctorId').isMongoId().withMessage('Invalid doctor ID'),
    query('date').isISO8601().withMessage('date query param must be in YYYY-MM-DD format'),
  ],
  validate,
  async (req, res) => {
    try {
      const { doctorId } = req.params;
      const { date } = req.query;

      const doctor = await User.findOne({ _id: doctorId, role: 'doctor' }).select('-password');
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }

      const availability = await Availability.findOne({ doctorId });
      if (!availability) {
        return res.json({ doctor, date, availableSlots: [] });
      }

      // Get all non-cancelled appointments for this doctor on the queried date
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const bookedAppointments = await Appointment.find({
        doctorId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'cancelled' },
      });

      const availableSlots = computeAvailableSlots(availability, bookedAppointments, date);

      res.json({ doctor, date, availableSlots });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// POST /api/patient/appointments
router.post(
  '/appointments',
  requirePatient,
  [
    body('doctorId').isMongoId().withMessage('Valid doctorId is required'),
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
    body('notes').optional().trim(),
  ],
  validate,
  async (req, res) => {
    try {
      const { doctorId, date, startTime, endTime, duration, notes } = req.body;

      // Verify doctor exists
      const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }

      // Check the slot is actually available
      const availability = await Availability.findOne({ doctorId });
      if (!availability) {
        return res.status(400).json({ message: 'Doctor has no availability set' });
      }

      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const bookedAppointments = await Appointment.find({
        doctorId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'cancelled' },
      });

      const availableSlots = computeAvailableSlots(availability, bookedAppointments, date);
      const slotExists = availableSlots.some((s) => s.startTime === startTime);

      if (!slotExists) {
        return res.status(400).json({ message: 'Selected time slot is not available' });
      }

      const appointment = await Appointment.create({
        doctorId,
        patientId: req.session.userId,
        date: new Date(date),
        startTime,
        endTime,
        duration,
        notes,
        status: 'confirmed',
      });

      await appointment.populate('doctorId', 'name email specialty');

      res.status(201).json({ message: 'Appointment booked successfully', appointment });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// GET /api/patient/appointments
router.get('/appointments', requirePatient, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.session.userId })
      .populate('doctorId', 'name email specialty')
      .sort({ date: 1, startTime: 1 });

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/patient/appointments/:id  (cancel)
router.delete(
  '/appointments/:id',
  requirePatient,
  [param('id').isMongoId().withMessage('Invalid appointment ID')],
  validate,
  async (req, res) => {
    try {
      const appointment = await Appointment.findOne({
        _id: req.params.id,
        patientId: req.session.userId,
      });

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      if (appointment.status === 'cancelled') {
        return res.status(400).json({ message: 'Appointment is already cancelled' });
      }

      appointment.status = 'cancelled';
      await appointment.save();

      res.json({ message: 'Appointment cancelled successfully', appointment });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
