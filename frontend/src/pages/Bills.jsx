import { useState } from 'react';
import BillCard from '../components/BillCard';
import BillScanner from '../components/BillScanner';
import SplitCard from '../components/SplitCard';
import './Bills.css';

export default function Bills() {
  const [bills, setBills] = useState([]);

  const [activeTab, setActiveTab] = useState('bills');

  const handleDeleteBill = (id) => {
    setBills(bills.filter((b) => b.id !== id));
  };

  const addDemoBill = () => {
    const names = ['The Grand Kitchen', 'Spice Route', 'Blue Lagoon', 'Urban Bites', 'Saffron House'];
    const newBill = {
      id: Date.now(),
      name: names[Math.floor(Math.random() * names.length)],
      items: [
        { name: 'Item 1', price: Math.round(Math.random() * 300 + 50) },
        { name: 'Item 2', price: Math.round(Math.random() * 200 + 30) },
      ],
      createdAt: new Date().toISOString(),
    };
    setBills([newBill, ...bills]);
  };

  return (
    <div className="bills-page">
      <div className="bills-header animate-fade-in-up">
        <div>
          <h1>Bills</h1>
          <p className="text-muted">Manage restaurant bills & scan receipts</p>
        </div>
        <button className="btn btn-primary" onClick={addDemoBill}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Bill
        </button>
      </div>

      <div className="bills-tabs animate-fade-in-up stagger-1">
        <button
          className={`bills-tab ${activeTab === 'bills' ? 'bills-tab-active' : ''}`}
          onClick={() => setActiveTab('bills')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <path d="M7 8h10M7 12h6"></path>
          </svg>
          All Bills
        </button>
        <button
          className={`bills-tab ${activeTab === 'scan' ? 'bills-tab-active' : ''}`}
          onClick={() => setActiveTab('scan')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
          Scan Bill
        </button>
        <button
          className={`bills-tab ${activeTab === 'split' ? 'bills-tab-active' : ''}`}
          onClick={() => setActiveTab('split')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          Quick Split
        </button>
      </div>

      <div className="bills-content">
        {activeTab === 'bills' && (
          <div className="bills-grid animate-fade-in-up">
            {bills.length === 0 ? (
              <div className="bills-empty card-static">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="M7 8h10M7 12h6M7 16h8"></path>
                </svg>
                <h3>No bills yet</h3>
                <p className="text-sm text-muted">Add a new bill or scan a receipt to get started</p>
              </div>
            ) : (
              bills.map((bill, i) => (
                <div key={bill.id} className={`stagger-${Math.min(i + 1, 6)}`} style={{ opacity: 0, animation: `fadeInUp 0.4s ease forwards`, animationDelay: `${i * 0.05}s` }}>
                  <BillCard bill={bill} onDelete={handleDeleteBill} />
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'scan' && (
          <div className="bills-scan-section card-static animate-fade-in-up">
            <BillScanner />
          </div>
        )}

        {activeTab === 'split' && (
          <div className="animate-fade-in-up">
            <SplitCard />
          </div>
        )}
      </div>
    </div>
  );
}
