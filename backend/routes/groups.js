const router = require('express').Router();
const auth = require('../middleware/auth');
const Group = require('../models/Group');
const User = require('../models/User');

// Create group
router.post('/', auth, async (req, res) => {
  try {
    const group = await Group.create({
      name: req.body.name,
      members: [req.user.userId],
      createdBy: req.user.userId
    });
    res.json(group);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get my groups
router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.userId }).populate('members', 'name email');
    res.json(groups);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add member by email
router.post('/:id/members', auth, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: user._id } },
      { new: true }
    ).populate('members', 'name email');
    res.json(group);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;