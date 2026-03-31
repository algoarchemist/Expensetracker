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

// Scan bill image → OCR → return extracted items (NO auth required)
router.post('/scan', upload.single('bill'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { data: { text } } = await Tesseract.recognize(req.file.path, 'eng');

    const items = parseBillText(text);

    res.json({
      rawText: text,
      items,
      imageUrl: `/uploads/${req.file.filename}`
    });
  } catch (err) {
    console.error('OCR Error:', err);
    res.status(500).json({ message: 'Failed to scan bill: ' + err.message });
  }
});

// Robust bill text parser
function parseBillText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const items = [];

  console.log('=== OCR RAW TEXT ===');
  console.log(text);
  console.log('=== END OCR TEXT ===');

  // Words that indicate non-item lines (totals, taxes, headers, etc.)
  const skipWords = /\b(total|subtotal|sub\s*total|grand\s*total|tax|gst|cgst|sgst|vat|service\s*charge|discount|tip|change|cash|card|balance|amount\s*due|thank|welcome|invoice|receipt\s*no|bill\s*no|table\s*no|date|time|order|server|cashier|phone|tel|address|fssai|payment|mode|online|upi|rupee|qty.*item.*price.*amount|item.*name|sr\s*no)\b/i;

  for (const line of lines) {
    // Skip lines that are clearly not items
    if (skipWords.test(line)) continue;
    if (line.length < 3) continue;
    // Skip lines that are just numbers, dashes, or symbols
    if (/^[\d\s.,\-=_*#|:]+$/.test(line)) continue;
    // Skip lines that are only alphabetic headers (like restaurant name, address)
    if (!/\d/.test(line)) continue;

    let matched = false;

    // Pattern 0 (HIGHEST PRIORITY): "2  Coffee  20.00  40.00" (QTY  ITEM  UNIT_PRICE  TOTAL)
    // This is the most common Indian restaurant bill format
    {
      const m = line.match(/^(\d+)\s+(.+?)\s+(\d+[\d,]*\.?\d{0,2})\s+(\d+[\d,]*\.?\d{0,2})\s*$/);
      if (m) {
        const qty = parseInt(m[1]);
        const name = m[2].replace(/[.\-_|]+$/, '').replace(/^[.\-_|]+/, '').trim();
        const unitPrice = parseFloat(m[3].replace(/,/g, ''));
        const totalPrice = parseFloat(m[4].replace(/,/g, ''));
        if (name.length >= 1 && totalPrice > 0 && qty > 0 && qty <= 999) {
          items.push({
            name,
            quantity: qty,
            price: unitPrice,
            totalPrice: totalPrice
          });
          matched = true;
        }
      }
    }

    // Pattern 0b: "Coffee  2  20.00  40.00" (ITEM  QTY  UNIT_PRICE  TOTAL)
    if (!matched) {
      const m = line.match(/^([a-zA-Z][\w\s&'\/\-.]+?)\s+(\d+)\s+(\d+[\d,]*\.?\d{0,2})\s+(\d+[\d,]*\.?\d{0,2})\s*$/);
      if (m) {
        const name = m[1].replace(/[.\-_|]+$/, '').trim();
        const qty = parseInt(m[2]);
        const unitPrice = parseFloat(m[3].replace(/,/g, ''));
        const totalPrice = parseFloat(m[4].replace(/,/g, ''));
        if (name.length >= 2 && totalPrice > 0 && qty > 0 && qty <= 999) {
          items.push({
            name,
            quantity: qty,
            price: unitPrice,
            totalPrice: totalPrice
          });
          matched = true;
        }
      }
    }

    // Pattern 1: "2 x Pizza  250" or "2x Pizza 250.00"
    if (!matched) {
      const qtyTimesMatch = line.match(/^(\d+)\s*[xX×]\s*(.+?)\s+[₹$Rs.]*\s*(\d+[\d,]*\.?\d{0,2})\s*$/);
      if (qtyTimesMatch) {
        const qty = parseInt(qtyTimesMatch[1]);
        const name = qtyTimesMatch[2].replace(/[.\-_]+$/, '').trim();
        const price = parseFloat(qtyTimesMatch[3].replace(/,/g, ''));
        if (name.length >= 2 && price > 0) {
          items.push({ name, quantity: qty, price: price, totalPrice: qty * price });
          matched = true;
        }
      }
    }

    // Pattern 2: "Pizza  2  250" (name  qty  price – only 2 numbers)
    if (!matched) {
      const nameQtyPrice = line.match(/^([a-zA-Z][\w\s&'\/\-.]+?)\s+(\d+)\s+[₹$Rs.]*\s*(\d+[\d,]*\.?\d{0,2})\s*$/);
      if (nameQtyPrice) {
        const name = nameQtyPrice[1].replace(/[.\-_]+$/, '').trim();
        const qty = parseInt(nameQtyPrice[2]);
        const price = parseFloat(nameQtyPrice[3].replace(/,/g, ''));
        if (name.length >= 2 && price > 0 && qty > 0 && qty <= 50) {
          items.push({ name, quantity: qty, price: price / qty, totalPrice: price });
          matched = true;
        }
      }
    }

    // Pattern 3: "Pizza ₹250" or "Pizza Rs.250" or "Pizza Rs 250"
    if (!matched) {
      const namePrice = line.match(/^(.+?)\s+[₹$]?\s*[Rr][Ss]\.?\s*(\d+[\d,]*\.?\d{0,2})\s*$/);
      if (namePrice) {
        const name = namePrice[1].replace(/[.\-_]+$/, '').trim();
        const price = parseFloat(namePrice[2].replace(/,/g, ''));
        if (name.length >= 2 && price > 0) {
          items.push({ name, quantity: 1, price, totalPrice: price });
          matched = true;
        }
      }
    }

    // Pattern 4: "Pizza  250" or "Coke  60.00" (name + multi-space + number)
    if (!matched) {
      const simpleMatch = line.match(/^([a-zA-Z][\w\s&'\/\-.]+?)\s{2,}[₹$]?\s*(\d+[\d,]*\.?\d{0,2})\s*$/);
      if (simpleMatch) {
        const name = simpleMatch[1].replace(/[.\-_]+$/, '').trim();
        const price = parseFloat(simpleMatch[2].replace(/,/g, ''));
        if (name.length >= 2 && price > 0 && price < 100000) {
          items.push({ name, quantity: 1, price, totalPrice: price });
          matched = true;
        }
      }
    }

    // Pattern 5: "Pizza 250" (single space fallback)
    if (!matched) {
      const fallback = line.match(/^([a-zA-Z][\w\s&'\/\-.]+?)\s+[₹$]?\s*(\d+[\d,]*\.?\d{0,2})\s*$/);
      if (fallback) {
        const name = fallback[1].replace(/[.\-_]+$/, '').trim();
        const price = parseFloat(fallback[2].replace(/,/g, ''));
        if (name.length >= 2 && price > 0 && price < 100000) {
          items.push({ name, quantity: 1, price, totalPrice: price });
        }
      }
    }
  }

  return items;
}

// Upload bill image → OCR → save to DB (requires auth)
router.post('/upload', auth, upload.single('bill'), async (req, res) => {
  try {
    const { data: { text } } = await Tesseract.recognize(req.file.path, 'eng');
    const items = parseBillText(text);
    const bill = await Bill.create({
      groupId: req.body.groupId,
      imageUrl: `/uploads/${req.file.filename}`,
      items: items.map(i => ({ name: i.name, price: i.totalPrice, claimedBy: [] }))
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