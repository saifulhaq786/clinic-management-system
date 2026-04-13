const Prescription = require('../models/Prescription');
const User = require('../models/User');
const { generatePrescriptionPDF } = require('../utils/pdf');
const { sendPrescriptionAlert } = require('../utils/notifications');
const { logAction } = require('../utils/audit');

exports.createPrescription = async (req, res) => {
  try {
    const { patientId, medicines, notes } = req.body;
    const doctorId = req.user.id;

    const prescription = new Prescription({
      doctorId,
      patientId,
      medicines,
      notes,
    });

    await prescription.save();

    // Generate PDF
    const doctor = await User.findById(doctorId);
    const patient = await User.findById(patientId);
    const { filename, filepath } = await generatePrescriptionPDF(prescription, doctor, patient);

    prescription.pdfUrl = filepath;
    await prescription.save();

    // Send notification
    await sendPrescriptionAlert(patient.email, patient.name, doctor.name);

    // Log action
    await logAction(doctorId, 'prescribe', 'prescription', prescription._id, { patientId }, req);

    res.status(201).json({ message: 'Prescription created', prescription, pdfUrl: filepath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const prescriptions = await Prescription.find({
      $or: [{ patientId: userId }, { doctorId: userId }],
      status: 'active',
    }).populate('doctorId', 'name specialty').populate('patientId', 'name email');

    await logAction(userId, 'view_prescriptions', 'prescription', null, {}, req);

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.downloadPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findById(id);

    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });

    const file = prescription.pdfUrl.replace(/^\//, '');
    const filepath = require('path').join(__dirname, `/../${file}`);

    res.download(filepath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.revokePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findById(id);

    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });

    prescription.status = 'revoked';
    await prescription.save();

    await logAction(req.user.id, 'revoke_prescription', 'prescription', id, {}, req);

    res.json({ message: 'Prescription revoked', prescription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
