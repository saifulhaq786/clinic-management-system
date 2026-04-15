const router = require('express').Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Helper function to calculate distance between two coordinates (in km)
const calculateDistance = (coord1, coord2) => {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// @route   GET api/appointments/nearby
// @desc    Find clinics within 15km with queue info
router.get('/nearby', auth, async (req, res) => {
  try {
    const { lng, lat } = req.query;
    
    if (!lng || !lat) return res.status(400).json({ message: "Coordinates required" });

    const clinics = await User.find({
      role: 'doctor',
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: 15000
        }
      }
    }).select('-password');

    // Enrich with queue info and distance
    const enriched = await Promise.all(clinics.map(async (doctor) => {
      const queueCount = await Appointment.countDocuments({
        doctorId: doctor._id,
        status: { $in: ['pending', 'accepted'] }
      });
      const distance = calculateDistance([parseFloat(lng), parseFloat(lat)], doctor.location.coordinates);
      return {
        ...doctor.toObject(),
        queueCount,
        distance: parseFloat(distance.toFixed(2)),
        estimatedWait: queueCount * 15
      };
    }));

    // Mock External Clinics from "Google Places API"
    const mockExternalClinics = [
      {
        _id: 'ext_google_1',
        name: 'City Care Hospital (External)',
        specialty: 'General Hospital',
        rating: 4.8,
        totalReviews: 124,
        distance: 2.4,
        isExternal: true,
        address: '123 Medical Blvd'
      },
      {
        _id: 'ext_google_2',
        name: 'Prime Health Clinic (External)',
        specialty: 'Multispecialty',
        rating: 4.5,
        totalReviews: 89,
        distance: 4.1,
        isExternal: true,
        address: '45 Wellness Ave'
      },
      {
        _id: 'ext_google_3',
        name: 'Sunrise Medical Center (External)',
        specialty: 'Urgent Care',
        rating: 4.2,
        totalReviews: 56,
        distance: 6.3,
        isExternal: true,
        address: '77 Emergency Rd'
      }
    ];

    res.json([...enriched, ...mockExternalClinics].sort((a,b) => a.distance - b.distance));
  } catch (err) {
    console.error("Nearby Error:", err);
    res.status(500).json({ message: "Error fetching nearby clinics" });
  }
});

// @route   GET api/appointments/doctor/:doctorId
// @desc    Get detailed doctor info
router.get('/doctor/:doctorId', auth, async (req, res) => {
  try {
    const doctor = await User.findById(req.params.doctorId).select('-password');
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    
    const queueCount = await Appointment.countDocuments({
      doctorId: doctor._id,
      status: { $in: ['pending', 'accepted'] }
    });

    res.json({
      ...doctor.toObject(),
      queueCount,
      estimatedWait: queueCount * 15
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching doctor details" });
  }
});

// @route   POST api/appointments/book
// @desc    Book a new appointment with scheduled date
router.post('/book', auth, async (req, res) => {
  try {
    const { doctorId, doctorName, patientName, reason, scheduledDate } = req.body;
    
    if (!doctorId || !reason || !scheduledDate) {
      return res.status(400).json({ message: "Missing required fields: doctorId, reason, scheduledDate" });
    }

    const newAppointment = new Appointment({ 
      patientId: req.user.id,
      doctorId,
      doctorName,
      patientName: patientName || 'Patient',
      reason,
      scheduledDate: new Date(scheduledDate)
    });
    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (err) {
    console.error("❌ Booking Error:", err.message);
    res.status(500).json({ message: "Error booking appointment: " + err.message });
  }
});

// @route   GET api/appointments/list
// @desc    Get appointments for the logged-in user
router.get('/list', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'doctor' ? { doctorId: req.user.id } : { patientId: req.user.id };
    const list = await Appointment.find(filter).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error("❌ Appointment List Error:", err.message);
    res.status(500).json({ message: "Error fetching appointments" });
  }
});

// @route   GET api/appointments/vault/:appointmentId
// @desc    Get medical vault for completed appointment
router.get('/vault/:appointmentId', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    
    res.json({
      prescription: appointment.prescription,
      prescriptionFiles: appointment.prescriptionFiles || [],
      doctorNotes: appointment.doctorNotes,
      labReports: appointment.labReports || [],
      completedDate: appointment.completedDate,
      doctorName: appointment.doctorName
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching medical vault" });
  }
});

// @route   PATCH api/appointments/:id
// @desc    Update appointment with prescription and notes
router.patch('/:id', auth, async (req, res) => {
  try {
    const { status, prescription, doctorNotes, prescriptionFiles, scheduledDate } = req.body;
    
    const updateData = { status, updatedAt: Date.now() };
    if (prescription !== undefined) updateData.prescription = prescription;
    if (doctorNotes !== undefined) updateData.doctorNotes = doctorNotes;
    if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);
    if (status === 'completed') updateData.completedDate = Date.now();

    // Map base64 data URLs from client to `fileUrl` for MongoDB schema
    if (prescriptionFiles && Array.isArray(prescriptionFiles)) {
      updateData.prescriptionFiles = prescriptionFiles.map(f => ({
        fileName: f.fileName,
        fileUrl: f.dataURL
      }));
    }

    const updated = await Appointment.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating appointment" });
  }
});

// @route   GET api/appointments/upcoming/:patientId
// @desc    Get patient's next appointment
router.get('/upcoming/:patientId', auth, async (req, res) => {
  try {
    const nextApt = await Appointment.findOne({
      patientId: req.params.patientId,
      status: { $in: ['pending', 'accepted'] }
    }).sort({ scheduledDate: 1 });

    res.json(nextApt || { message: "No upcoming appointments" });
  } catch (err) {
    res.status(500).json({ message: "Error fetching upcoming appointment" });
  }
});

module.exports = router;

module.exports = router;
