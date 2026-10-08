import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  Eye, 
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export function LoginPage() {
  const { login, backendStatus } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    const res = await login(email, password);
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMessage(res.error || 'Invalid credentials. Please verify your email and password.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      await authAPI.forgotPassword(forgotEmail);
      setForgotSent(true);
    } catch {
      setForgotSent(true);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      background: 'var(--bg-app)',
      backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(37, 99, 235, 0.05) 0%, transparent 40%)'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
            marginBottom: '16px'
          }}>
            <ShieldCheck size={30} color="#ffffff" strokeWidth={2.4} />
          </div>

          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--text-title)',
            letterSpacing: '-0.03em',
            margin: '0 0 6px 0'
          }}>
            AutoGlass <span style={{ color: '#10b981' }}>PRO</span>
          </h1>

          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            margin: 0
          }}>
            Vehicle Glass POS &amp; Inventory Management Engine
          </p>
        </div>

        {/* Login Card */}
        <div className="saas-card" style={{ padding: '32px 28px' }}>
          <div style={{ marginBottom: '22px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-title)' }}>
              Sign in to your account
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Enter your work email and password to access the system.
            </p>
          </div>

          {errorMessage && (
            <div style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--rose-pill-bg)',
              color: 'var(--rose-pill-text)',
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '18px'
            }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Pure Credentials Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-title)',
                marginBottom: '6px'
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="saas-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="name@glasspos.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-title)'
                }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="saas-input"
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-saas btn-dark"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.9rem',
                marginTop: '8px'
              }}
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to POS Workspace'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Subtle test hint note (text only, no auto login buttons) */}
          <div style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-light)',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            lineHeight: 1.5
          }}>
            Default Seed Credentials: <code style={{ color: 'var(--text-title)' }}>admin@glasspos.com</code> or <code style={{ color: 'var(--text-title)' }}>staff1@glasspos.com</code> &bull; Pass: <code style={{ color: 'var(--text-title)' }}>password123</code>
          </div>
        </div>

        {/* Live Backend Connection Status Pill at bottom */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <span className={`status-pill ${backendStatus.isLive ? 'status-pill-green' : 'status-pill-amber'}`}>
            <span className="status-dot" />
            <span>{backendStatus.isLive ? `Backend Online (port :5000)` : 'Seed Demo Mode Available'}</span>
          </span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setIsForgotOpen(false)}>
          <div className="saas-card" style={{ maxWidth: '400px', width: '100%', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Reset Password</h3>
              <button onClick={() => setIsForgotOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>&times;</button>
            </div>

            {forgotSent ? (
              <div>
                <div style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--emerald-pill-bg)',
                  color: 'var(--emerald-pill-text)',
                  fontSize: '0.85rem',
                  marginBottom: '16px'
                }}>
                  Password reset link has been dispatched to <strong>{forgotEmail}</strong>.
                </div>
                <button onClick={() => { setIsForgotOpen(false); setForgotSent(false); }} className="btn-saas btn-dark" style={{ width: '100%' }}>
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Enter your email address to receive password reset instructions.
                </p>
                <input
                  type="email"
                  className="saas-input"
                  required
                  placeholder="name@glasspos.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
                <button type="submit" className="btn-saas btn-dark">Send Reset Link</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
