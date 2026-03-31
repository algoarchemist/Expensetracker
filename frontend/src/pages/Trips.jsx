import { useState, useEffect } from 'react';
import TripCard from '../components/TripCard';
import TripDetail from '../components/TripDetail';
import Modal from '../components/Modal';
import api from '../utils/api';
import './Trips.css';

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [useLocal, setUseLocal] = useState(false);

  // New trip form
  const [newName, setNewName] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newMembers, setNewMembers] = useState('');

  // Load trips
  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const { data } = await api.get('/trips');
      setTrips(data);
      setUseLocal(false);
    } catch {
      // Fallback to local storage if backend unavailable
      const local = JSON.parse(localStorage.getItem('sb_trips') || '[]');
      setTrips(local);
      setUseLocal(true);
    }
    setLoading(false);
  };

  const saveLocal = (updated) => {
    localStorage.setItem('sb_trips', JSON.stringify(updated));
    setTrips(updated);
  };

  const createTrip = async () => {
    if (!newName.trim() || !newBudget || parseFloat(newBudget) <= 0) return;

    const members = newMembers.split(',').map((m) => m.trim()).filter(Boolean);
    const tripData = {
      name: newName.trim(),
      budget: parseFloat(newBudget),
      members,
    };

    try {
      if (useLocal) {
        const newTrip = {
          ...tripData,
          _id: 'local_' + Date.now(),
          expenses: [],
          createdAt: new Date().toISOString(),
        };
        saveLocal([newTrip, ...trips]);
      } else {
        const { data } = await api.post('/trips', tripData);
        setTrips([data, ...trips]);
      }
    } catch {
      const newTrip = {
        ...tripData,
        _id: 'local_' + Date.now(),
        expenses: [],
        createdAt: new Date().toISOString(),
      };
      saveLocal([newTrip, ...trips]);
      setUseLocal(true);
    }

    setNewName('');
    setNewBudget('');
    setNewMembers('');
    setShowModal(false);
  };

  const deleteTrip = async (tripId) => {
    try {
      if (useLocal || tripId.startsWith('local_')) {
        saveLocal(trips.filter((t) => t._id !== tripId));
      } else {
        await api.delete(`/trips/${tripId}`);
        setTrips(trips.filter((t) => t._id !== tripId));
      }
    } catch {
      saveLocal(trips.filter((t) => t._id !== tripId));
    }
  };

  const addExpense = async (expense) => {
    if (!selectedTrip) return;
    const id = selectedTrip._id;

    try {
      if (useLocal || id.startsWith('local_')) {
        const updated = trips.map((t) => {
          if (t._id === id) {
            return {
              ...t,
              expenses: [
                ...t.expenses,
                { ...expense, _id: 'exp_' + Date.now(), date: new Date().toISOString() },
              ],
            };
          }
          return t;
        });
        saveLocal(updated);
        setSelectedTrip(updated.find((t) => t._id === id));
      } else {
        const { data } = await api.post(`/trips/${id}/expenses`, expense);
        setTrips(trips.map((t) => (t._id === id ? data : t)));
        setSelectedTrip(data);
      }
    } catch {
      // fallback to local
      const updated = trips.map((t) => {
        if (t._id === id) {
          return {
            ...t,
            expenses: [
              ...t.expenses,
              { ...expense, _id: 'exp_' + Date.now(), date: new Date().toISOString() },
            ],
          };
        }
        return t;
      });
      saveLocal(updated);
      setSelectedTrip(updated.find((t) => t._id === id));
    }
  };

  const deleteExpense = async (expId) => {
    if (!selectedTrip) return;
    const id = selectedTrip._id;

    try {
      if (useLocal || id.startsWith('local_')) {
        const updated = trips.map((t) => {
          if (t._id === id) {
            return { ...t, expenses: t.expenses.filter((e) => e._id !== expId) };
          }
          return t;
        });
        saveLocal(updated);
        setSelectedTrip(updated.find((t) => t._id === id));
      } else {
        const { data } = await api.delete(`/trips/${id}/expenses/${expId}`);
        setTrips(trips.map((t) => (t._id === id ? data : t)));
        setSelectedTrip(data);
      }
    } catch {
      const updated = trips.map((t) => {
        if (t._id === id) {
          return { ...t, expenses: t.expenses.filter((e) => e._id !== expId) };
        }
        return t;
      });
      saveLocal(updated);
      setSelectedTrip(updated.find((t) => t._id === id));
    }
  };

  if (loading) {
    return (
      <div className="trips-page">
        <div className="trips-loading">
          <div className="loading-spinner"></div>
          <span className="text-muted">Loading trips...</span>
        </div>
      </div>
    );
  }

  if (selectedTrip) {
    return (
      <div className="trips-page">
        <TripDetail
          trip={selectedTrip}
          onAddExpense={addExpense}
          onDeleteExpense={deleteExpense}
          onBack={() => setSelectedTrip(null)}
        />
      </div>
    );
  }

  return (
    <div className="trips-page">
      <div className="trips-header animate-fade-in-up">
        <div>
          <h1>Trips</h1>
          <p className="text-muted">Track expenses & budgets for your trips</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Trip
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="trips-empty card-static animate-fade-in-up stagger-1">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path>
          </svg>
          <h3>No trips yet</h3>
          <p className="text-sm text-muted">Create a trip to start tracking expenses and budgets</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create First Trip</button>
        </div>
      ) : (
        <div className="trips-grid">
          {trips.map((trip, i) => (
            <div
              key={trip._id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <TripCard trip={trip} onClick={() => setSelectedTrip(trip)} onDelete={deleteTrip} />
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Trip">
        <div className="trip-create-form">
          <div className="input-group">
            <label>Trip Name</label>
            <input
              type="text"
              placeholder="e.g., Goa Beach Trip"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Budget</label>
            <div className="input-with-prefix" style={{ position: 'relative' }}>
              <span className="input-prefix" style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9375rem', zIndex: 1, pointerEvents: 'none' }}>₹</span>
              <input
                type="number"
                placeholder="4000"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                min="0"
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>
          <div className="input-group">
            <label>Members (comma-separated)</label>
            <input
              type="text"
              placeholder="Alice, Bob, Charlie"
              value={newMembers}
              onChange={(e) => setNewMembers(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-lg btn-full" onClick={createTrip} style={{ marginTop: '8px' }}>
            Create Trip
          </button>
        </div>
      </Modal>
    </div>
  );
}
