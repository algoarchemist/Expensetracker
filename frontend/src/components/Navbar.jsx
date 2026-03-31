import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar({ onToggleSidebar }) {
  const { user, isLoggedIn, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="navbar-toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div className="navbar-brand">
          <svg className="navbar-logo" width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
            <path d="M10 16h12M16 10v12M10 10l12 12M22 10L10 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
            <path d="M9 13h6M9 16h4M9 19h5M17 13h6M17 16h6M17 19h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <defs>
              <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#2563EB"/>
                <stop offset="1" stopColor="#7C3AED"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="navbar-title gradient-text">SplitBill</span>
        </div>
      </div>

      <div className="navbar-right">
        {isLoggedIn ? (
          <div className="navbar-user">
            <div className="navbar-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="navbar-username">{user?.name}</span>
            <button className="btn btn-ghost btn-sm" onClick={logout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        ) : (
          <a href="/login" className="btn btn-primary btn-sm">Sign In</a>
        )}
      </div>
    </nav>
  );
}
