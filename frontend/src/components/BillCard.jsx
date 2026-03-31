import { useState } from 'react';
import './BillCard.css';

export default function BillCard({ bill, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState(bill.name || 'Restaurant Bill');
  const [editing, setEditing] = useState(false);

  const total = bill.items?.reduce((s, i) => s + i.price, 0) || 0;
  const date = new Date(bill.createdAt || Date.now());

  return (
    <div className="bill-card card">
      <div className="bill-card-top">
        <div className="bill-card-info">
          <div className="bill-card-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <div>
            {editing ? (
              <input
                className="bill-card-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setEditing(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
                autoFocus
              />
            ) : (
              <h4 className="bill-card-name" onClick={() => setEditing(true)}>
                {name}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </h4>
            )}
            <span className="bill-card-total">₹{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="bill-card-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Hide' : 'More Details'}
            <svg
              width="14" height="14"
              viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          {onDelete && (
            <button
              className="bill-card-delete-btn"
              onClick={(e) => { e.stopPropagation(); onDelete(bill._id || bill.id); }}
              aria-label="Delete bill"
              title="Delete bill"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className={`bill-card-details ${expanded ? 'bill-card-details-open' : ''}`}>
        <div className="bill-detail-row">
          <span className="bill-detail-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Date
          </span>
          <span className="bill-detail-value">{date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
        <div className="bill-detail-row">
          <span className="bill-detail-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Time
          </span>
          <span className="bill-detail-value">{date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="bill-detail-row">
          <span className="bill-detail-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path>
            </svg>
            Total
          </span>
          <span className="bill-detail-value bill-detail-total">₹{total.toFixed(2)}</span>
        </div>
        <div className="bill-detail-row">
          <span className="bill-detail-label">Items</span>
          <span className="bill-detail-value">{bill.items?.length || 0}</span>
        </div>

      </div>
    </div>
  );
}
