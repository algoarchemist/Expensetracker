const mongoose = require('mongoose');

const tripExpenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount:      { type: Number, required: true },
  category:    { type: String, enum: ['Travel', 'Accommodation', 'Food', 'Miscellaneous'], default: 'Miscellaneous' },
  date:        { type: Date, default: Date.now }
});

const tripSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  budget:    { type: Number, required: true },
  members:   [{ type: String }], // simple name strings for flexibility
  expenses:  [tripExpenseSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trip', tripSchema);
