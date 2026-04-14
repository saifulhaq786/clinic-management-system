const router = require('express').Router();
const BloodRequest = require('../models/BloodRequest');
const auth = require('../middleware/auth');

// @route   POST api/blood/request
// @desc    Create a new blood donation request
router.post('/request', auth, async (req, res) => {
  try {
    const { patientName, bloodType, hospitalName, location, unitsRequired, contactPhone, urgency } = req.body;
    
    if (!patientName || !bloodType || !hospitalName || !location || !unitsRequired || !contactPhone) {
      return res.status(400).json({ error: "Missing required fields for blood request" });
    }

    const request = new BloodRequest({
      requesterId: req.user.id,
      patientName,
      bloodType,
      hospitalName,
      location,
      unitsRequired,
      contactPhone,
      urgency
    });

    await request.save();
    res.status(201).json(request);
  } catch (err) {
    console.error("Blood request error:", err);
    res.status(500).json({ error: "Failed to create blood request" });
  }
});

// @route   GET api/blood/list
// @desc    Get all open blood requests
router.get('/list', auth, async (req, res) => {
  try {
    // Return Open requests, sorted by urgency (Critical first) and then date
    const requests = await BloodRequest.find({ status: 'Open' })
      .populate('requesterId', 'name email phone avatar')
      .sort({ urgency: -1, createdAt: -1 });
    
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch blood requests" });
  }
});

// @route   POST api/blood/donate/:id
// @desc    Pledge to donate blood for a specific request
router.post('/donate/:id', auth, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    
    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.status !== 'Open') return res.status(400).json({ error: "This request is no longer open" });
    if (request.requesterId.toString() === req.user.id) return res.status(400).json({ error: "You cannot pledge to your own request" });

    // Check if already pledged
    const alreadyPledged = request.donors.some(d => d.donorId.toString() === req.user.id);
    if (alreadyPledged) {
      return res.status(400).json({ error: "You have already pledged to this request" });
    }

    request.donors.push({ donorId: req.user.id });
    
    // Auto-fulfill if we have enough donors (assuming 1 unit per donor for simplicity)
    if (request.donors.length >= request.unitsRequired) {
      request.status = 'Fulfilled';
    }

    await request.save();
    
    // Return updated document populated
    const updatedRequest = await BloodRequest.findById(req.params.id).populate('requesterId', 'name email phone');
    res.json({ message: "Pledge successful!", request: updatedRequest });
  } catch (err) {
    res.status(500).json({ error: "Failed to pledge donation" });
  }
});

// @route   GET api/blood/my-requests
// @desc    Get requests made by the current user
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requesterId: req.user.id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch your requests" });
  }
});

module.exports = router;
