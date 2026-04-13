const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   PUT /api/profile/complete
// @desc    Update user profile after login
// @access  Private
router.put('/complete', auth, async (req, res) => {
  try {
    const { name, age, gender, bloodGroup } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name || !age || !gender) {
      return res.status(400).json({ 
        error: "Name, age, and gender are required" 
      });
    }

    // Find and update user
    const user = await User.findByIdAndUpdate(
      userId,
      {
        name,
        age: parseInt(age),
        gender,
        bloodGroup: bloodGroup || ''
      },
      { new: true } // Return updated document
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        age: user.age,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Profile update error:", err.message);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// @route   GET /api/profile/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        age: user.age,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar
      }
    });

  } catch (err) {
    console.error("Profile fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

module.exports = router;
