const { Router } = require('express');
const { authenticateUser } = require('../middleware/auth');
const User = require('../models/User');

const router = Router();

// Student-accessible leaderboard
router.get('/', authenticateUser, async (req, res) => {
  try {
    const topStudents = await User.find({ role: 'student' })
      .select('name ecoPoints')
      .sort({ ecoPoints: -1 })
      .limit(10);
    
    res.json({ data: topStudents });
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to get leaderboard' } });
  }
});

module.exports = router;