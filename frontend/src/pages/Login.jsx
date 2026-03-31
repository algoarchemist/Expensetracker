import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const body = isRegister ? { name, email, password } : { email, password };
      const { data } = await api.post(endpoint, body);
      login(data.user, data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-bg-orb login-bg-orb-1"></div>
      <div className="login-bg-orb login-bg-orb-2"></div>

      <div className="login-card animate-scale-in">
        <div className="login-logo">
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#lg)" />
            <path d="M9 13h6M9 16h4M9 19h5M17 13h6M17 16h6M17 19h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <defs><linearGradient id="lg" x1="0" y1="0" x2="32" y2="32"><stop stopColor="#2563EB"/><stop offset="1" stopColor="#7C3AED"/></linearGradient></defs>
          </svg>
          <h1 className="gradient-text">SplitBill</h1>
        </div>

        <p className="login-subtitle">{isRegister ? 'Create your account' : 'Welcome back'}</p>

        <div className="login-tabs">
          <button
            className={`login-tab ${!isRegister ? 'login-tab-active' : ''}`}
            onClick={() => { setIsRegister(false); setError(''); }}
          >
            Sign In
          </button>
          <button
            className={`login-tab ${isRegister ? 'login-tab-active' : ''}`}
            onClick={() => { setIsRegister(true); setError(''); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <div className="input-group animate-fade-in">
              <label htmlFor="login-name">Full Name</label>
              <input
                id="login-name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <div className="login-error animate-fade-in">{error}</div>}

          <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
