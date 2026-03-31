const router = require('express').Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const Group = require('../models/Group');

// Add expense (splits evenly)
router.post('/', auth, async (req, res) => {
  try {
    const { groupId, description, totalAmount } = req.body;
    const group = await Group.findById(groupId);
    const perPerson = totalAmount / group.members.length;
    const splits = group.members.map(memberId => ({ userId: memberId, amount: perPerson }));
    const expense = await Expense.create({
      groupId, description, totalAmount,
      paidBy: req.user.userId, splits
    });
    res.json(expense);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get expenses for a group
router.get('/:groupId', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ groupId: req.params.groupId })
      .populate('paidBy', 'name')
      .populate('splits.userId', 'name');
    res.json(expenses);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get balances — who owes whom
router.get('/:groupId/balances', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ groupId: req.params.groupId });
    const balance = {};
    expenses.forEach(exp => {
      const payerId = exp.paidBy.toString();
      balance[payerId] = (balance[payerId] || 0) + exp.totalAmount;
      exp.splits.forEach(s => {
        const uid = s.userId.toString();
        balance[uid] = (balance[uid] || 0) - s.amount;
      });
    });
    res.json(balance);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;