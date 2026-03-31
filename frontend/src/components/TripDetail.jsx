import { useState } from 'react';
import CountUp from './CountUp';
import ProgressBar from './ProgressBar';
import './TripDetail.css';

const CATEGORIES = [
  { key: 'Travel', icon: '✈️', label: 'Travel' },
  { key: 'Accommodation', icon: '🏨', label: 'Accommodation' },
  { key: 'Food', icon: '🍽️', label: 'Food' },
  { key: 'Miscellaneous', icon: '📦', label: 'Miscellaneous' },
];

export default function TripDetail({ trip, onAddExpense, onDeleteExpense, onBack }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [showSplit, setShowSplit] = useState(false);

  const totalSpent = trip.expenses?.reduce((s, e) => s + e.amount, 0) || 0;
  const remaining = trip.budget - totalSpent;
  const percentage = trip.budget > 0 ? (totalSpent / trip.budget) * 100 : 0;

  const categoryTotals = CATEGORIES.map((cat) => ({
    ...cat,
    total: trip.expenses?.filter((e) => e.category === cat.key).reduce((s, e) => s + e.amount, 0) || 0,
  }));

  const perPerson = trip.members?.length > 0 ? totalSpent / trip.members.length : totalSpent;

  const handleAdd = () => {
    if (!description.trim() || !amount || parseFloat(amount) <= 0) return;
    onAddExpense({
      description: description.trim(),
      amount: parseFloat(amount),
      category,
    });
    setDescription('');
    setAmount('');
  };

  return (
    <div className="trip-detail">
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: '16px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Trips
      </button>

      <div className="trip-detail-header animate-fade-in-up">
        <div>
          <h2>{trip.name}</h2>
          <span className="text-sm text-muted">{trip.members?.length || 0} members</span>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="trip-budget-overview card-static animate-fade-in-up stagger-1">
        <div className="trip-budget-top">
          <div className="trip-budget-remaining">
            <span className="text-sm text-muted">Remaining Balance</span>
            <span className={`trip-budget-amount ${remaining < 0 ? 'text-danger' : 'gradient-text'}`}>
              <CountUp end={Math.abs(remaining)} prefix={remaining < 0 ? '-₹' : '₹'} decimals={0} duration={1000} />
            </span>
          </div>
          <div className="trip-budget-stats">
            <div className="trip-stat">
              <span className="trip-stat-label">Budget</span>
              <span className="trip-stat-value">₹{trip.budget.toLocaleString()}</span>
            </div>
            <div className="trip-stat">
              <span className="trip-stat-label">Spent</span>
              <span className="trip-stat-value">₹<CountUp end={totalSpent} decimals={0} /></span>
            </div>
          </div>
        </div>
        <ProgressBar percentage={percentage} />
      </div>

      {/* Category Cards */}
      <div className="trip-categories animate-fade-in-up stagger-2">
        {categoryTotals.map((cat) => (
          <div key={cat.key} className="trip-category-card card-static">
            <span className="trip-category-emoji">{cat.icon}</span>
            <span className="trip-category-label">{cat.label}</span>
            <span className="trip-category-amount font-semibold">
              ₹<CountUp end={cat.total} decimals={0} />
            </span>
          </div>
        ))}
      </div>

      {/* Add Expense */}
      <div className="trip-add-expense card-static animate-fade-in-up stagger-3">
        <h3>Add Expense</h3>
        <div className="trip-add-form">
          <input
            type="text"
            placeholder="Description (e.g., Cab to airport)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="trip-add-row">
            <div className="input-with-prefix" style={{ flex: 1 }}>
              <span className="input-prefix">₹</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
              />
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>{cat.icon} {cat.label}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary btn-full" onClick={handleAdd}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Expense
          </button>
        </div>
      </div>

      {/* Expenses List */}
      {trip.expenses?.length > 0 && (
        <div className="trip-expenses-list animate-fade-in-up stagger-4">
          <h3>Expenses</h3>
          <div className="trip-expenses-items">
            {[...trip.expenses].reverse().map((exp) => (
              <div key={exp._id || Math.random()} className="trip-expense-item">
                <div className="trip-expense-info">
                  <span className="trip-expense-cat-emoji">
                    {CATEGORIES.find(c => c.key === exp.category)?.icon || '📦'}
                  </span>
                  <div>
                    <span className="trip-expense-desc">{exp.description}</span>
                    <span className="trip-expense-date text-xs text-muted">
                      {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
                <div className="trip-expense-right">
                  <span className="trip-expense-amount">₹{exp.amount.toLocaleString()}</span>
                  <button
                    className="trip-expense-delete"
                    onClick={() => onDeleteExpense(exp._id)}
                    aria-label="Delete expense"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Split Trip */}
      <div className="trip-split-section animate-fade-in-up stagger-5">
        <button
          className="btn btn-primary btn-lg btn-full"
          onClick={() => setShowSplit(!showSplit)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
            <path d="M16 3.13a4 4 0 010 7.75"></path>
          </svg>
          Split Trip Expenses
        </button>

        {showSplit && trip.members?.length > 0 && (
          <div className="trip-split-result animate-scale-in">
            <div className="trip-split-header">
              <span className="text-sm text-muted">Each person pays</span>
              <span className="trip-split-amount gradient-text">
                <CountUp end={perPerson} prefix="₹" decimals={2} duration={1000} />
              </span>
            </div>
            <div className="trip-split-members">
              {trip.members.map((member, i) => (
                <div key={i} className="trip-split-member">
                  <div className="trip-split-avatar">{member.charAt(0).toUpperCase()}</div>
                  <span className="trip-split-name">{member}</span>
                  <span className="trip-split-member-amount">₹{perPerson.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
