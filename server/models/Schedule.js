const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dayOfWeek: { type: Number, enum: [0, 1, 2, 3, 4, 5, 6], required: true }, // 0=Sunday, 6=Saturday
  startTime: String, // HH:mm format
  endTime: String, // HH:mm format
  slotDuration: { type: Number, default: 30 }, // minutes
  maxAppointments: { type: Number, default: 10 },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Schedule', scheduleSchema);
