const { Router } = require('express');
const { authenticateUser } = require('../middleware/auth');
const { updateEcoPoints } = require('../services/gamificationService');
const User = require('../models/User');

const router = Router();

router.post('/complete-content', authenticateUser, async (req, res) => {
  try {
    const { courseId, points = 10 } = req.body;
    const userId = req.user.id;
    
    // Update user's ecoPoints
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { ecoPoints: points } },
      { new: true }
    );
    
    res.json({ 
      data: { 
        awarded: points, 
        totalEcoPoints: updatedUser.ecoPoints 
      } 
    });
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to update ecoPoints' } });
  }
});

module.exports = router;