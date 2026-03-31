const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  groupId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  imageUrl: String,
  items: [{
    name:      String,
    price:     Number,
    claimedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  settled:   { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bill', billSchema);