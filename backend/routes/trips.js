const router = require('express').Router();
const Trip = require('../models/Trip');

// Create trip
router.post('/', async (req, res) => {
  try {
    const { name, budget, members } = req.body;
    const trip = await Trip.create({ name, budget, members, expenses: [] });
    res.json(trip);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all trips
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get single trip
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add expense to trip
router.post('/:id/expenses', async (req, res) => {
  try {
    const { description, amount, category } = req.body;
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    trip.expenses.push({ description, amount, category, date: new Date() });
    await trip.save();
    res.json(trip);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete expense from trip
router.delete('/:id/expenses/:expId', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    trip.expenses = trip.expenses.filter(e => e._id.toString() !== req.params.expId);
    await trip.save();
    res.json(trip);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete trip
router.delete('/:id', async (req, res) => {
  try {
    await Trip.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trip deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get split calculation
router.get('/:id/split', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    const totalSpent = trip.expenses.reduce((s, e) => s + e.amount, 0);
    const perPerson = trip.members.length > 0 ? totalSpent / trip.members.length : totalSpent;
    res.json({
      totalSpent,
      perPerson,
      remaining: trip.budget - totalSpent,
      members: trip.members
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
