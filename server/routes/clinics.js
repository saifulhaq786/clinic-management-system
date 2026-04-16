const express = require('express');
const router2 = express.Router();
const Clinic = require('../models/Clinic');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied: No token provided' });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// @route POST /api/clinics/register
// @desc Register a new clinic
router2.post('/register', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, description, registrationNumber, addressLine1, addressLine2, city, state, pincode, coordinates } = req.body;
    
    // Ensure the user registering the clinic gets the 'clinic_admin' role
    await User.findByIdAndUpdate(req.user.id, { role: 'clinic_admin' });

    const newClinic = new Clinic({
      name,
      email,
      phone,
      ownerId: req.user.id,
      registrationNumber,
      description,
      address: {
        line1: addressLine1,
        line2: addressLine2 || '',
        city,
        state,
        pincode
      },
      location: {
        type: 'Point',
        coordinates: coordinates || [0, 0] // [longitude, latitude]
      }
    });

    const savedClinic = await newClinic.save();
    res.status(201).json(savedClinic);
  } catch (error) {
    res.status(500).json({ error: 'Failed to register clinic', details: error.message });
  }
});

// @route GET /api/clinics/nearby
// @desc Get clinics near a location
router2.get('/nearby', async (req, res) => {
  try {
    const { lng, lat, maxDistance = 50000 } = req.query; // maxDistance in meters (defaults to 50km)

    if (!lng || !lat) {
      // If no constraints, just return all clinics
      const clinics = await Clinic.find().populate('ownerId', 'name email').populate('doctors', 'name specialty');
      return res.json(clinics);
    }

    const clinics = await Clinic.find({
      location: {
        $near: {
          $maxDistance: parseInt(maxDistance),
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          }
        }
      }
    }).populate('doctors', 'name specialty');
    
    res.json(clinics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch nearby clinics', details: error.message });
  }
});

// @route POST /api/clinics/:clinicId/add-doctor
// @desc Add a doctor to a clinic
router2.post('/:clinicId/add-doctor', authMiddleware, async (req, res) => {
  try {
    const { doctorId } = req.body;
    const clinic = await Clinic.findById(req.params.clinicId);
    
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
    
    // Only owner can add doctors
    if (clinic.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only clinic owner can add doctors' });
    }

    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if(!doctor || doctor.role !== 'doctor') {
      return res.status(400).json({ error: 'Valid doctor ID required' });
    }

    if (!clinic.doctors.includes(doctorId)) {
      clinic.doctors.push(doctorId);
      await clinic.save();
    }
    
    if (!doctor.affiliatedClinics.includes(clinic._id)) {
      doctor.affiliatedClinics.push(clinic._id);
      await doctor.save();
    }

    res.json({ message: 'Doctor added successfully', clinic });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add doctor to clinic', details: error.message });
  }
});

// @route PUT /api/clinics/:clinicId
// @desc Update clinic details
router2.put('/:clinicId', authMiddleware, async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.clinicId);
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
    
    if (clinic.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only clinic owner can update details' });
    }

    const { name, email, phone, description, registrationNumber, addressLine1, addressLine2, city, state, pincode, coordinates } = req.body;

    if (name) clinic.name = name;
    if (email) clinic.email = email;
    if (phone) clinic.phone = phone;
    if (description) clinic.description = description;
    if (registrationNumber) clinic.registrationNumber = registrationNumber;
    
    if (addressLine1) clinic.address.line1 = addressLine1;
    if (addressLine2 !== undefined) clinic.address.line2 = addressLine2;
    if (city) clinic.address.city = city;
    if (state) clinic.address.state = state;
    if (pincode) clinic.address.pincode = pincode;

    if (coordinates && coordinates.length === 2) {
      clinic.location.coordinates = coordinates;
    }

    const updatedClinic = await clinic.save();
    res.json(updatedClinic);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update clinic', details: error.message });
  }
});

// @route GET /api/clinics/my-clinic
// @desc Get the clinic owned by the current user
router2.get('/my-clinic', authMiddleware, async (req, res) => {
  try {
    const clinic = await Clinic.findOne({ ownerId: req.user.id })
      .populate('doctors', 'name email phone specialty bio')
      .populate('ownerId', 'name email');
    if (!clinic) return res.status(404).json({ error: 'No clinic found for this user' });
    res.json(clinic);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your clinic', details: error.message });
  }
});

// @route POST /api/clinics/:clinicId/register-doctor
// @desc Register a new doctor by a clinic admin
router2.post('/:clinicId/register-doctor', authMiddleware, async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.clinicId);
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });

    // Only owner can register doctors
    if (clinic.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: Only the clinic administrator can onboard doctors.' });
    }

    const { name, email, phone, specialty, bio } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      // If user exists, check if they are already a doctor
      if (user.role !== 'doctor' && user.role !== 'patient') {
         return res.status(400).json({ error: 'User already exists with a different administrative role.' });
      }
      
      // Upgrade role or keep as doctor
      user.role = 'doctor';
      if (specialty) user.specialty = specialty;
      if (bio) user.bio = bio;
      if (phone) user.phone = phone;
    } else {
      // Create new doctor user
      const salt = await bcrypt.genSalt(10);
      const defaultPassword = 'Welcome' + Math.floor(1000 + Math.random() * 9000); // Random numeric suffix for basic security
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);
      
      user = new User({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'doctor',
        phone,
        specialty,
        bio,
        isVerified: true // Auto-verify since created by admin
      });
      
      // We will return the temp password to the admin oncely
      res.locals.tempPassword = defaultPassword;
    }

    // Link doctor to clinic if not already linked
    if (!clinic.doctors.includes(user._id)) {
      clinic.doctors.push(user._id);
    }
    
    if (!user.affiliatedClinics.includes(clinic._id)) {
      user.affiliatedClinics.push(clinic._id);
    }

    await user.save();
    await clinic.save();

    res.status(201).json({
      message: 'Doctor onboarded successfully',
      doctor: {
        id: user._id,
        name: user.name,
        email: user.email,
        tempPassword: res.locals.tempPassword // This will be defined only if a new user was created
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'A user with this email or registration details already exists.' });
    }
    res.status(500).json({ error: 'Failed to onboard doctor', details: error.message });
  }
});

module.exports = router2;
