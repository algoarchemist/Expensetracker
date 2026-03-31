import SplitCard from '../components/SplitCard';
import './Dashboard.css';

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-header animate-fade-in-up">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted">Split bills, track expenses, manage trips</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Quick Split */}
        <div className="animate-fade-in-up stagger-1">
          <SplitCard />
        </div>

        {/* Quick Actions */}
        <div className="animate-fade-in-up stagger-2">
          <div className="dashboard-quick-actions card-static">
            <h3>Quick Actions</h3>
            <div className="quick-actions-grid">
              <a href="/bills" className="quick-action-item">
                <div className="quick-action-icon qa-bills">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="M7 8h10M7 12h6M7 16h8"></path>
                  </svg>
                </div>
                <span className="quick-action-label">View Bills</span>
                <span className="quick-action-desc text-xs text-muted">Scan & manage restaurant bills</span>
              </a>

              <a href="/trips" className="quick-action-item">
                <div className="quick-action-icon qa-trips">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path>
                  </svg>
                </div>
                <span className="quick-action-label">Track Trip</span>
                <span className="quick-action-desc text-xs text-muted">Budget & split trip expenses</span>
              </a>

              <a href="/login" className="quick-action-item">
                <div className="quick-action-icon qa-account">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4-4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <span className="quick-action-label">Account</span>
                <span className="quick-action-desc text-xs text-muted">Sign in for full features</span>
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="dashboard-stats card-static" style={{ marginTop: '16px' }}>
            <h3>How It Works</h3>
            <div className="how-it-works">
              <div className="how-step">
                <div className="how-step-num">1</div>
                <div>
                  <span className="font-medium">Enter the bill</span>
                  <span className="text-xs text-muted">Type or scan your receipt</span>
                </div>
              </div>
              <div className="how-step">
                <div className="how-step-num">2</div>
                <div>
                  <span className="font-medium">Choose items</span>
                  <span className="text-xs text-muted">Select what each person ordered</span>
                </div>
              </div>
              <div className="how-step">
                <div className="how-step-num">3</div>
                <div>
                  <span className="font-medium">Split instantly</span>
                  <span className="text-xs text-muted">Everyone knows what they owe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
