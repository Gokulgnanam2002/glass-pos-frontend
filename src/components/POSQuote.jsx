import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Car, 
  Wrench, 
  CheckCircle, 
  Printer, 
  User, 
  Phone
} from 'lucide-react';
import { productsAPI } from '../services/api';

export function POSQuote({ quoteItems, onUpdateQuantity, onRemoveItem, onClearQuote }) {
  const [customerName, setCustomerName] = useState('Michael Scott');
  const [customerPhone, setCustomerPhone] = useState('(555) 382-9912');
  const [vehicleVin, setVehicleVin] = useState('4T1B11HK5MU129841');
  const [includeCalibration, setIncludeCalibration] = useState(true);
  const [includeInstallation, setIncludeInstallation] = useState(true);
  const [laborCharge, setLaborCharge] = useState(120);
  const [calibrationCharge, setCalibrationCharge] = useState(180);
  const [isCompleted, setIsCompleted] = useState(false);

  const partsSubtotal = quoteItems.reduce((acc, item) => acc + (item.unitPrice * (item.quantity || 1)), 0);
  const laborSubtotal = (includeInstallation ? Number(laborCharge) : 0) + (includeCalibration ? Number(calibrationCharge) : 0);
  const subtotal = partsSubtotal + laborSubtotal;
  const tax = subtotal * 0.0825;
  const grandTotal = subtotal + tax;

  const handleCompleteSale = async () => {
    for (const item of quoteItems) {
      await productsAPI.adjustStock(item.id, -(item.quantity || 1));
    }
    setIsCompleted(true);
  };

  const handleReset = () => {
    onClearQuote();
    setIsCompleted(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="greeting-title" style={{ fontSize: '1.75rem', margin: 0 }}>
            POS Counter Ticket &amp; Quote
          </h1>
          <p className="greeting-subtitle">
            Generate instant quotes, add ADAS calibration, and process retail counter sales.
          </p>
        </div>

        {quoteItems.length > 0 && !isCompleted && (
          <button onClick={onClearQuote} className="btn-saas btn-outline-white" style={{ fontSize: '0.8rem' }}>
            Clear Ticket
          </button>
        )}
      </div>

      {isCompleted ? (
        <div className="saas-card" style={{ padding: '60px 24px', textAlign: 'center', maxWidth: '580px', margin: '0 auto', width: '100%' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--emerald-pill-bg)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <CheckCircle size={36} />
          </div>

          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--text-title)' }}>
            Glass POS Order #AG-{Math.floor(10000 + Math.random() * 90000)} Created!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
            Inventory stock has been deducted. Receipt and work order dispatched for {customerName}.
          </p>

          <div style={{
            background: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '18px',
            textAlign: 'left',
            marginBottom: '24px',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
              <strong>{customerName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Vehicle VIN:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{vehicleVin}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
              <span style={{ fontWeight: 700 }}>Total Paid:</span>
              <span style={{ fontWeight: 800, color: '#10b981', fontSize: '1.2rem' }}>${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => window.print()} className="btn-saas btn-outline-white">
              <Printer size={16} /> Print Receipt
            </button>
            <button onClick={handleReset} className="btn-saas btn-lime">
              Start New Ticket
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.7fr) minmax(320px, 1fr)', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Customer Box */}
            <div className="saas-card" style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-title)' }}>
                <User size={16} color="#2563eb" /> Customer &amp; Vehicle Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Customer Name</label>
                  <input type="text" className="saas-input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                  <input type="text" className="saas-input" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>VIN / Plate #</label>
                  <input type="text" className="saas-input" value={vehicleVin} onChange={(e) => setVehicleVin(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Selected Glass Parts List */}
            <div className="saas-card" style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-title)' }}>
                <ShoppingCart size={16} color="#10b981" /> Glass Replacement Parts ({quoteItems.length})
              </h3>

              {quoteItems.length === 0 ? (
                <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Car size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>No glass parts in this ticket yet.</p>
                  <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                    Browse the <strong>Compatibility Finder</strong> or <strong>Inventory</strong> to add items.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {quoteItems.map((item) => (
                    <div 
                      key={item.id}
                      style={{
                        padding: '14px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-surface-subtle)',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-title)', fontSize: '0.9rem' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{item.sku}</span> &bull; {item.brandName} {item.modelName}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                          <Minus size={14} />
                        </button>
                        <span style={{ fontWeight: 700, minWidth: '18px', textAlign: 'center' }}>
                          {item.quantity || 1}
                        </span>
                        <button onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-title)' }}>
                          <Plus size={14} />
                        </button>
                      </div>

                      <div style={{ textAlign: 'right', minWidth: '80px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-title)' }}>
                          ${(item.unitPrice * (item.quantity || 1)).toFixed(2)}
                        </div>
                      </div>

                      <button onClick={() => onRemoveItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f43f5e' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Installation & Calibration */}
            <div className="saas-card" style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-title)' }}>
                <Wrench size={16} color="#d97706" /> Professional Installation &amp; Calibration
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" checked={includeInstallation} onChange={(e) => setIncludeInstallation(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#10b981' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Auto Glass Installation Labor</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Urethane adhesive kit &amp; pinchweld prep</div>
                    </div>
                  </div>
                  <input type="number" className="saas-input" value={laborCharge} onChange={(e) => setLaborCharge(e.target.value)} disabled={!includeInstallation} style={{ width: '85px', textAlign: 'right' }} />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" checked={includeCalibration} onChange={(e) => setIncludeCalibration(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#10b981' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>ADAS Forward Camera Recalibration</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Static target optical alignment report</div>
                    </div>
                  </div>
                  <input type="number" className="saas-input" value={calibrationCharge} onChange={(e) => setCalibrationCharge(e.target.value)} disabled={!includeCalibration} style={{ width: '85px', textAlign: 'right' }} />
                </label>
              </div>
            </div>
          </div>

          {/* Right Summary */}
          <div>
            <div className="saas-card" style={{ padding: '24px', position: 'sticky', top: '90px' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', color: 'var(--text-title)' }}>Ticket Summary</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Parts Total:</span>
                  <strong>${partsSubtotal.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Installation:</span>
                  <strong>${(includeInstallation ? Number(laborCharge) : 0).toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>ADAS Recalibration:</span>
                  <strong>${(includeCalibration ? Number(calibrationCharge) : 0).toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tax (8.25%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-light)', marginTop: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total Due:</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-title)', fontFamily: 'var(--font-heading)' }}>
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={handleCompleteSale}
                  disabled={quoteItems.length === 0}
                  className="btn-saas btn-lime"
                  style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
                >
                  <CheckCircle size={18} />
                  <span>Complete Counter Sale</span>
                </button>
                <button
                  onClick={() => window.print()}
                  disabled={quoteItems.length === 0}
                  className="btn-saas btn-outline-white"
                  style={{ width: '100%' }}
                >
                  <Printer size={16} /> Print Estimate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
