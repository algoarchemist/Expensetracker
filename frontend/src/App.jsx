import { useEffect, useMemo, useState } from 'react';
import './App.css';

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const tripCategories = ['Travel', 'Accommodation', 'Food', 'Miscellaneous'];

function AnimatedNumber({ value, duration = 450, format = (n) => n.toFixed(2) }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const from = display;
    const to = Number.isFinite(value) ? value : 0;

    const tick = (time) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const next = from + (to - from) * (1 - (1 - progress) ** 3);
      setDisplay(next);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span>{format(display)}</span>;
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [billInput, setBillInput] = useState({ total: '', people: '' });
  const [billResult, setBillResult] = useState(null);

  const [savedBills, setSavedBills] = useState([]);
  const [billName, setBillName] = useState('');

  const [scanItems, setScanItems] = useState([
    { id: 1, name: 'Pizza', price: 250, selected: false },
    { id: 2, name: 'Coke', price: 60, selected: false },
    { id: 3, name: 'Pasta', price: 180, selected: false },
  ]);

  const [tripBudget, setTripBudget] = useState(4000);
  const [tripExpenses, setTripExpenses] = useState([]);
  const [tripForm, setTripForm] = useState({ category: 'Travel', amount: '', note: '' });
  const [tripPeople, setTripPeople] = useState(1);

  const splitShare = useMemo(() => {
    if (!billResult) return 0;
    return billResult.total / billResult.people;
  }, [billResult]);

  const scannedTotal = useMemo(
    () => scanItems.filter((item) => item.selected).reduce((sum, item) => sum + item.price, 0),
    [scanItems],
  );

  const spent = useMemo(() => tripExpenses.reduce((sum, item) => sum + item.amount, 0), [tripExpenses]);
  const remaining = Math.max(tripBudget - spent, 0);
  const usage = tripBudget > 0 ? Math.min((spent / tripBudget) * 100, 100) : 0;

  const progressColor = usage < 50 ? '#2563EB' : usage < 80 ? '#F59E0B' : '#EF4444';

  const categoryTotals = useMemo(() => {
    return tripCategories.reduce((acc, cat) => {
      acc[cat] = tripExpenses
        .filter((exp) => exp.category === cat)
        .reduce((sum, exp) => sum + exp.amount, 0);
      return acc;
    }, {});
  }, [tripExpenses]);

  const splitTripPerPerson = tripPeople > 0 ? spent / tripPeople : 0;

  const handleSplitBill = (event) => {
    event.preventDefault();
    const total = Number(billInput.total);
    const people = Number(billInput.people);
    if (!total || !people || people < 1) return;
    setBillResult({ total, people, createdAt: new Date() });
  };

  const addSavedBill = () => {
    if (!billResult) return;
    setSavedBills((prev) => [
      {
        id: crypto.randomUUID(),
        name: billName || `Bill #${prev.length + 1}`,
        total: billResult.total,
        people: billResult.people,
        share: billResult.total / billResult.people,
        date: new Date(),
      },
      ...prev,
    ]);
    setBillName('');
  };

  const toggleItem = (id) => {
    setScanItems((prev) => prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)));
  };

  const addTripExpense = (event) => {
    event.preventDefault();
    const amount = Number(tripForm.amount);
    if (!amount || amount < 0) return;
    setTripExpenses((prev) => [
      {
        id: crypto.randomUUID(),
        category: tripForm.category,
        amount,
        note: tripForm.note || 'Expense',
      },
      ...prev,
    ]);
    setTripForm((prev) => ({ ...prev, amount: '', note: '' }));
  };

  return (
    <div className="app-shell">
      <header className="topbar glass">
        <h1>SplitBill</h1>
        <div className="avatar" title="Profile">SB</div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          {[
            ['dashboard', 'Dashboard'],
            ['bills', 'Bills'],
            ['trips', 'Trips'],
          ].map(([key, label]) => (
            <button
              key={key}
              className={`nav-link ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </aside>

        <main className="content">
          {(activeTab === 'dashboard' || activeTab === 'bills') && (
            <section className="panel fade-in">
              <h2>Bill Split</h2>
              <form className="grid-two" onSubmit={handleSplitBill}>
                <label>
                  Total Bill Amount
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={billInput.total}
                    onChange={(event) => setBillInput((prev) => ({ ...prev, total: event.target.value }))}
                    placeholder="e.g. 1200"
                  />
                </label>
                <label>
                  Number of People
                  <input
                    type="number"
                    min="1"
                    value={billInput.people}
                    onChange={(event) => setBillInput((prev) => ({ ...prev, people: event.target.value }))}
                    placeholder="e.g. 4"
                  />
                </label>
                <button className="primary" type="submit">Split Bill</button>
              </form>

              {billResult && (
                <article className="result-card slide-up">
                  <p>Total Amount: <strong>{currency.format(billResult.total)}</strong></p>
                  <p>People: <strong>{billResult.people}</strong></p>
                  <p className="highlight">
                    Share per person: <AnimatedNumber value={splitShare} format={(n) => currency.format(n)} />
                  </p>
                  <div className="save-row">
                    <input
                      value={billName}
                      onChange={(event) => setBillName(event.target.value)}
                      placeholder="Restaurant name"
                    />
                    <button className="secondary" onClick={addSavedBill} type="button">Save Bill Card</button>
                  </div>
                </article>
              )}
            </section>
          )}

          {(activeTab === 'dashboard' || activeTab === 'bills') && (
            <section className="panel fade-in">
              <h2>Multiple Bills</h2>
              <div className="bill-grid">
                {savedBills.length === 0 && <p className="muted">No bills saved yet. Split and save one above.</p>}
                {savedBills.map((bill) => (
                  <details className="bill-card" key={bill.id}>
                    <summary>
                      <div>
                        <h3>{bill.name}</h3>
                        <p className="muted">{currency.format(bill.total)} · {bill.people} people</p>
                      </div>
                      <span className="chip">More Details</span>
                    </summary>
                    <div className="detail-content">
                      <p>Date: {bill.date.toLocaleDateString()}</p>
                      <p>Time: {bill.date.toLocaleTimeString()}</p>
                      <p>Total: {currency.format(bill.total)}</p>
                      <p className="highlight">Per person: {currency.format(bill.share)}</p>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {(activeTab === 'dashboard' || activeTab === 'bills') && (
            <section className="panel fade-in">
              <h2>Bill Scanning & Item Selection</h2>
              <ul className="items-list">
                {scanItems.map((item) => (
                  <li key={item.id} className={item.selected ? 'selected' : ''}>
                    <label>
                      <input type="checkbox" checked={item.selected} onChange={() => toggleItem(item.id)} />
                      <span>{item.name}</span>
                    </label>
                    <strong>{currency.format(item.price)}</strong>
                  </li>
                ))}
              </ul>
              <p className="highlight">
                Your selected total: <AnimatedNumber value={scannedTotal} format={(n) => currency.format(n)} />
              </p>
            </section>
          )}

          {(activeTab === 'dashboard' || activeTab === 'trips') && (
            <section className="panel fade-in">
              <h2>Trip Expense Tracker</h2>
              <div className="trip-overview">
                <label>
                  Total Budget
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tripBudget}
                    onChange={(event) => setTripBudget(Number(event.target.value) || 0)}
                  />
                </label>
                <p className="remaining">
                  Remaining: <AnimatedNumber value={remaining} format={(n) => currency.format(n)} />
                </p>
              </div>

              <div className="progress-track" aria-label="Budget usage">
                <div className="progress-fill" style={{ width: `${usage}%`, background: progressColor }} />
              </div>

              <div className="category-grid">
                {tripCategories.map((category) => (
                  <article key={category} className="category-card">
                    <h4>{category}</h4>
                    <p>{currency.format(categoryTotals[category] || 0)}</p>
                  </article>
                ))}
              </div>

              <form className="grid-three" onSubmit={addTripExpense}>
                <label>
                  Category
                  <select
                    value={tripForm.category}
                    onChange={(event) => setTripForm((prev) => ({ ...prev, category: event.target.value }))}
                  >
                    {tripCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Amount
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 120"
                    value={tripForm.amount}
                    onChange={(event) => setTripForm((prev) => ({ ...prev, amount: event.target.value }))}
                  />
                </label>

                <label>
                  Note
                  <input
                    value={tripForm.note}
                    placeholder="flight / lunch / taxi"
                    onChange={(event) => setTripForm((prev) => ({ ...prev, note: event.target.value }))}
                  />
                </label>

                <button className="primary" type="submit">Add Expense</button>
              </form>

              <div className="split-end">
                <label>
                  Split trip among people
                  <input
                    type="number"
                    min="1"
                    value={tripPeople}
                    onChange={(event) => setTripPeople(Number(event.target.value) || 1)}
                  />
                </label>
                <p className="highlight">Per person: {currency.format(splitTripPerPerson)}</p>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
