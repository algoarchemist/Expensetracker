import './ProgressBar.css';

export default function ProgressBar({ percentage = 0, showLabel = true }) {
  const clamped = Math.min(Math.max(percentage, 0), 100);
  
  // Color transitions: blue → yellow → red
  const getColor = (pct) => {
    if (pct <= 50) {
      // blue to yellow
      const hue = 220 - (pct / 50) * (220 - 45);
      return `hsl(${hue}, 85%, 56%)`;
    } else {
      // yellow to red
      const hue = 45 - ((pct - 50) / 50) * 45;
      return `hsl(${hue}, 85%, 56%)`;
    }
  };

  const color = getColor(clamped);

  return (
    <div className="progress-bar-wrapper">
      {showLabel && (
        <div className="progress-bar-label">
          <span className="progress-bar-pct" style={{ color }}>{Math.round(clamped)}%</span>
          <span className="progress-bar-text">of budget used</span>
        </div>
      )}
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{
            width: `${clamped}%`,
            background: `linear-gradient(90deg, ${getColor(Math.max(clamped - 20, 0))}, ${color})`,
            boxShadow: `0 0 12px ${color}40, 0 0 4px ${color}30`
          }}
        >
          <div className="progress-bar-shine"></div>
        </div>
      </div>
    </div>
  );
}
