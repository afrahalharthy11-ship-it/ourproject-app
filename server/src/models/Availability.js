const mongoose = require('mongoose');

const recurringSlotSchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6, // 0=Sunday, 6=Saturday
  },
  startTime: {
    type: String,
    required: true, // "HH:MM" format e.g. "09:00"
  },
  endTime: {
    type: String,
    required: true, // "HH:MM" format e.g. "10:00"
  },
  duration: {
    type: Number,
    required: true, // minutes
    min: 1,
  },
});

const specificSlotSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
  },
});

const availabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    recurringSlots: [recurringSlotSchema],
    specificSlots: [specificSlotSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Availability', availabilitySchema);
