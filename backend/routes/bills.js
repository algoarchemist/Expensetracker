const router = require('express').Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const Tesseract = require('tesseract.js');
const Bill = require('../models/Bill');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Upload bill image → OCR → return items
router.post('/upload', auth, upload.single('bill'), async (req, res) => {
  try {
    const { data: { text } } = await Tesseract.recognize(req.file.path, 'eng');
    const lines = text.split('\n');
    const items = [];
    lines.forEach(line => {
      const match = line.match(/^(.+?)\s+(\d+\.?\d{0,2})$/);
      if (match) {
        items.push({ name: match[1].trim(), price: parseFloat(match[2]), claimedBy: [] });
      }
    });
    const bill = await Bill.create({
      groupId: req.body.groupId,
      imageUrl: `/uploads/${req.file.filename}`,
      items
    });
    res.json(bill);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Claim an item
router.patch('/:billId/claim', auth, async (req, res) => {
  try {
    const { itemId } = req.body;
    const bill = await Bill.findById(req.params.billId);
    const item = bill.items.id(itemId);
    if (!item.claimedBy.includes(req.user.userId)) {
      item.claimedBy.push(req.user.userId);
    }
    await bill.save();
    res.json(bill);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get bills for a group
router.get('/:groupId', auth, async (req, res) => {
  try {
    const bills = await Bill.find({ groupId: req.params.groupId })
      .populate('items.claimedBy', 'name');
    res.json(bills);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;