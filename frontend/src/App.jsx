import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Bills from './pages/Bills';
import Trips from './pages/Trips';
import Login from './pages/Login';
import './App.css';

function App() {
  const { isLoggedIn, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Login page — no shell
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="*"
        element={
          <AppShell sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/bills" element={<Bills />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppShell>
        }
      />
    </Routes>
  );
}

function AppShell({ children, sidebarOpen, onToggleSidebar }) {
  return (
    <div className="app-shell">
      <Navbar onToggleSidebar={onToggleSidebar} />
      <Sidebar isOpen={sidebarOpen} />
      <main
        className="app-main"
        style={{
          marginLeft: sidebarOpen ? 'var(--sidebar-w)' : 'var(--sidebar-collapsed)',
        }}
      >
        {children}
      </main>
    </div>
  );
}

export default App;
