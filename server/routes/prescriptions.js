const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const prescriptionController = require('../controllers/prescriptionController');

// Doctor creates prescription
router.post('/create', auth, prescriptionController.createPrescription);

// Get prescriptions for patient/doctor
router.get('/list', auth, prescriptionController.getPrescriptions);

// Download prescription PDF
router.get('/download/:id', auth, prescriptionController.downloadPrescription);

// Revoke prescription (doctor only)
router.patch('/revoke/:id', auth, prescriptionController.revokePrescription);

module.exports = router;
