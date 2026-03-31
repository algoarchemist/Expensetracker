import CountUp from './CountUp';
import ProgressBar from './ProgressBar';
import './TripCard.css';

export default function TripCard({ trip, onClick, onDelete }) {
  const totalSpent = trip.expenses?.reduce((s, e) => s + e.amount, 0) || 0;
  const remaining = trip.budget - totalSpent;
  const percentage = trip.budget > 0 ? (totalSpent / trip.budget) * 100 : 0;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(trip._id);
  };

  return (
    <div className="trip-card card" onClick={onClick}>
      <div className="trip-card-header">
        <div className="trip-card-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <h4 className="trip-card-name">{trip.name}</h4>
          <span className="text-xs text-muted">{trip.members?.length || 0} members • {trip.expenses?.length || 0} expenses</span>
        </div>
        <button
          className="trip-card-delete-btn"
          onClick={handleDelete}
          aria-label="Delete trip"
          title="Delete trip"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
          </svg>
        </button>
      </div>

      <div className="trip-card-budget">
        <div className="trip-card-budget-row">
          <span className="text-sm text-muted">Budget</span>
          <span className="text-sm font-semibold">₹<CountUp end={trip.budget} decimals={0} /></span>
        </div>
        <div className="trip-card-budget-row">
          <span className="text-sm text-muted">Remaining</span>
          <span className={`text-sm font-semibold ${remaining < 0 ? 'text-danger' : ''}`}>
            ₹<CountUp end={Math.abs(remaining)} decimals={0} />
            {remaining < 0 && ' over'}
          </span>
        </div>
      </div>

      <ProgressBar percentage={percentage} showLabel={false} />
    </div>
  );
}

