import { useState } from 'react';
import CountUp from './CountUp';
import './SplitCard.css';

export default function SplitCard() {
  const [amount, setAmount] = useState('');
  const [people, setPeople] = useState('');
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleSplit = () => {
    const total = parseFloat(amount);
    const count = parseInt(people);
    if (!total || total <= 0 || !count || count <= 0) return;

    setShowResult(false);
    setTimeout(() => {
      setResult({ total, count, share: total / count });
      setShowResult(true);
    }, 50);
  };

  const handleReset = () => {
    setShowResult(false);
    setTimeout(() => {
      setAmount('');
      setPeople('');
      setResult(null);
    }, 300);
  };

  return (
    <div className="split-card card-static">
      <div className="split-card-header">
        <div className="split-card-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path>
          </svg>
        </div>
        <div>
          <h3>Quick Split</h3>
          <p className="text-sm text-muted">Split a bill instantly</p>
        </div>
      </div>

      <div className="split-card-form">
        <div className="input-group">
          <label htmlFor="split-amount">Total Amount</label>
          <div className="input-with-prefix">
            <span className="input-prefix">₹</span>
            <input
              id="split-amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="split-people">Number of People</label>
          <div className="input-with-prefix">
            <span className="input-prefix">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                <path d="M16 3.13a4 4 0 010 7.75"></path>
              </svg>
            </span>
            <input
              id="split-people"
              type="number"
              placeholder="2"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              min="1"
            />
          </div>
        </div>

        <button className="btn btn-primary btn-lg btn-full" onClick={handleSplit}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          Split Bill
        </button>
      </div>

      {result && (
        <div className={`split-result ${showResult ? 'split-result-visible' : ''}`}>
          <div className="split-result-divider">
            <span>Result</span>
          </div>

          <div className="split-result-grid">
            <div className="split-result-item">
              <span className="split-result-label">Total Bill</span>
              <span className="split-result-value">
                <CountUp end={result.total} prefix="₹" decimals={2} />
              </span>
            </div>
            <div className="split-result-item">
              <span className="split-result-label">People</span>
              <span className="split-result-value">
                <CountUp end={result.count} decimals={0} />
              </span>
            </div>
          </div>

          <div className="split-result-share">
            <span className="split-share-label">Per Person</span>
            <span className="split-share-value gradient-text">
              <CountUp end={result.share} prefix="₹" decimals={2} duration={1000} />
            </span>
          </div>

          <button className="btn btn-ghost btn-sm btn-full" onClick={handleReset} style={{ marginTop: '12px' }}>
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
