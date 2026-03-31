import { useState, useRef } from 'react';
import CountUp from './CountUp';
import './BillScanner.css';

export default function BillScanner() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [uploading, setUploading] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [scanError, setScanError] = useState('');
  const [rawText, setRawText] = useState('');
  const [showRawText, setShowRawText] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show image preview
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    setScanError('');
    setRawText('');

    const formData = new FormData();
    formData.append('bill', file);

    try {
      const res = await fetch('/api/bills/scan', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Scan failed');
      }

      const data = await res.json();
      setRawText(data.rawText || '');

      if (data.items && data.items.length > 0) {
        setItems(data.items.map((item, i) => ({
          id: i,
          name: item.name,
          quantity: item.quantity || 1,
          price: item.price,
          totalPrice: item.totalPrice || item.price,
        })));
        setSelected(new Set());
        setScanError('');
      } else {
        setScanError('No items could be extracted. Try a clearer image or add items manually.');
        setManualMode(true);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setScanError('Scan failed: ' + err.message + '. You can add items manually below.');
      setManualMode(true);
    }

    setUploading(false);
    // Reset file input so same file can be re-uploaded
    if (fileRef.current) fileRef.current.value = '';
  };

  const toggleItem = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map(i => i.id)));
    }
  };

  const addManualItem = () => {
    if (!newItemName.trim() || !newItemPrice) return;
    const qty = parseInt(newItemQty) || 1;
    const price = parseFloat(newItemPrice);
    const id = Date.now();
    setItems([...items, {
      id,
      name: newItemName.trim(),
      quantity: qty,
      price: price,
      totalPrice: qty * price,
    }]);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemQty('1');
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
    setSelected(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const selectedTotal = items
    .filter((item) => selected.has(item.id))
    .reduce((sum, item) => sum + item.totalPrice, 0);

  const allTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="bill-scanner">
      <div className="scanner-header">
        <h3>Bill Scanner</h3>
        <p className="text-sm text-muted">Upload a receipt to extract items, or add them manually</p>
      </div>

      <div className="scanner-actions">
        <label className="scanner-upload-btn btn btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
          {uploading ? 'Scanning...' : 'Upload Receipt'}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} hidden />
        </label>
        <button
          className={`btn ${manualMode ? 'btn-primary' : 'btn-ghost'} btn-sm`}
          onClick={() => setManualMode(!manualMode)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Manually
        </button>
      </div>

      {/* Uploading indicator */}
      {uploading && (
        <div className="scanner-status animate-fade-in">
          <div className="scanner-spinner"></div>
          <span>Scanning receipt with OCR... This may take a moment.</span>
        </div>
      )}

      {/* Error message */}
      {scanError && (
        <div className="scanner-error animate-fade-in-up">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{scanError}</span>
        </div>
      )}

      {/* Bill image preview */}
      {previewUrl && (
        <div className="scanner-preview animate-fade-in-up">
          <img src={previewUrl} alt="Uploaded bill" className="scanner-preview-img" />
          {rawText && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowRawText(!showRawText)}
              style={{ marginTop: '8px' }}
            >
              {showRawText ? 'Hide' : 'Show'} extracted text
            </button>
          )}
          {showRawText && rawText && (
            <pre className="scanner-raw-text">{rawText}</pre>
          )}
        </div>
      )}

      {/* Manual add form */}
      {manualMode && (
        <div className="manual-add-form animate-fade-in-up">
          <input
            type="text"
            placeholder="Item name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addManualItem()}
          />
          <div className="input-with-prefix" style={{ minWidth: '80px', maxWidth: '100px' }}>
            <span className="input-prefix">Qty</span>
            <input
              type="number"
              placeholder="1"
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
              min="1"
              style={{ paddingLeft: '38px' }}
            />
          </div>
          <div className="input-with-prefix" style={{ minWidth: '120px' }}>
            <span className="input-prefix">₹</span>
            <input
              type="number"
              placeholder="0"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              min="0"
              step="0.01"
              onKeyDown={(e) => e.key === 'Enter' && addManualItem()}
            />
          </div>
          <button className="btn btn-primary btn-sm" onClick={addManualItem}>Add</button>
        </div>
      )}

      {/* Items list */}
      {items.length > 0 && (
        <div className="scanner-items animate-fade-in-up">
          <div className="scanner-items-header">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{items.length} items found</span>
              <button className="btn btn-ghost btn-sm" onClick={selectAll}>
                {selected.size === items.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <span className="text-sm text-muted">Total: ₹{allTotal.toFixed(2)}</span>
          </div>

          <div className="scanner-items-list">
            {items.map((item) => (
              <div
                key={item.id}
                className={`scanner-item ${selected.has(item.id) ? 'scanner-item-selected' : ''}`}
                onClick={() => toggleItem(item.id)}
              >
                <div className="scanner-item-checkbox">
                  {selected.has(item.id) ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--primary)" stroke="white" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="4" />
                      <polyline points="8 12 11 15 16 9" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="4" />
                    </svg>
                  )}
                </div>
                <div className="scanner-item-info">
                  <span className="scanner-item-name">{item.name}</span>
                  {item.quantity > 1 && (
                    <span className="scanner-item-qty">{item.quantity} × ₹{item.price.toFixed(2)}</span>
                  )}
                </div>
                <span className="scanner-item-price">₹{item.totalPrice.toFixed(2)}</span>
                <button
                  className="scanner-item-remove"
                  onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                  aria-label="Remove item"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {selected.size > 0 && (
            <div className="scanner-selected-total animate-scale-in">
              <div>
                <span className="text-sm text-muted">Your share ({selected.size} items)</span>
                <span className="scanner-your-total gradient-text">
                  <CountUp end={selectedTotal} prefix="₹" decimals={2} />
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
