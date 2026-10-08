import React, { useEffect } from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';

export function LogoutModal({ isOpen, onClose, onConfirm }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px',
      animation: 'fadeIn 0.15s ease-out'
    }} onClick={onClose}>
      <div 
        className="saas-card" 
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '28px 24px',
          textAlign: 'center',
          boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.25), 0 0 1px rgba(0,0,0,0.2)',
          animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* SweetAlert Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#fef2f2',
          border: '4px solid #fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#e11d48',
          margin: '0 auto 18px',
          boxShadow: '0 8px 16px rgba(225, 29, 72, 0.15)'
        }}>
          <LogOut size={28} />
        </div>

        {/* Modal Title */}
        <h3 style={{
          fontSize: '1.3rem',
          fontWeight: 800,
          color: 'var(--text-title)',
          letterSpacing: '-0.02em',
          margin: '0 0 8px 0'
        }}>
          Sign Out of Workspace?
        </h3>

        {/* Modal Message */}
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          margin: '0 0 24px 0'
        }}>
          Are you sure you want to log out? Your session token will be cleared and you will be returned to the sign-in screen.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-saas btn-outline-white"
            style={{ width: '100%', padding: '10px' }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="btn-saas"
            style={{
              width: '100%',
              padding: '10px',
              background: '#e11d48',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)'
            }}
          >
            <LogOut size={15} />
            <span>Yes, Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
