const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true },
  doctorName: { type: String, required: true },
  reason: { type: String, required: true },
  
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'cancelled', 'completed'], 
    default: 'pending' 
  },
  isPaid: { type: Boolean, default: false },
  
  // Scheduling
  scheduledDate: { type: Date, default: null },
  completedDate: { type: Date, default: null },
  
  // Medical Records - Vault
  prescription: { type: String, default: "" },
  prescriptionFiles: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  doctorNotes: { type: String, default: "" },
  labReports: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', appointmentSchema);