import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react';
import { usersAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function UserManagement() {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'STAFF'
  });

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await usersAPI.getUsers();
      setUsers(res || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await authAPI.register(registerForm);
      await loadUsers();
      setIsRegisterModalOpen(false);
      setRegisterForm({ name: '', email: '', password: 'password123', role: 'STAFF' });
    } catch (err) {
      alert('Registration failed: ' + err.message);
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    if (!isAdmin) return;
    const newRole = currentRole === 'ADMIN' ? 'STAFF' : 'ADMIN';
    try {
      await usersAPI.updateUser(userId, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert('Could not update role: ' + err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!isAdmin) return;
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await usersAPI.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      alert('Could not delete user: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="greeting-title" style={{ fontSize: '1.75rem', margin: 0 }}>
            Staff &amp; Role Management
          </h1>
          <p className="greeting-subtitle">
            User access directory, role assignments (ADMIN vs STAFF), and staff onboarding.
          </p>
        </div>

        {isAdmin && (
          <button onClick={() => setIsRegisterModalOpen(true)} className="btn-saas btn-dark">
            <UserPlus size={16} />
            <span>Register New Staff</span>
          </button>
        )}
      </div>

      {!isAdmin && (
        <div style={{
          padding: '14px 18px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--blue-pill-bg)',
          border: '1px solid var(--border-light)',
          color: '#1d4ed8',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.85rem'
        }}>
          <AlertCircle size={16} />
          <span>Logged in as <strong>STAFF</strong>. Role updates and adding new staff requires <strong>ADMIN</strong> permissions.</span>
        </div>
      )}

      {/* Users Table */}
      <div className="saas-table-card">
        <table className="saas-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email Address</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Active</th>
              <th style={{ textAlign: 'right' }}>Admin Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isCurrentUser = currentUser?.email === u.email;
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="avatar-circle">
                        {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-title)' }}>{u.name || 'Staff User'}</strong>
                        {isCurrentUser && (
                          <span style={{ fontSize: '0.72rem', color: '#10b981', marginLeft: '6px' }}>(Current)</span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{u.email}</span></td>

                  <td>
                    <span className={`status-pill ${u.role === 'ADMIN' ? 'status-pill-blue' : 'status-pill-green'}`}>
                      {u.role}
                    </span>
                  </td>

                  <td>
                    <span className="status-pill status-pill-green">
                      <span className="status-dot" /> {u.status || 'ACTIVE'}
                    </span>
                  </td>

                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{u.lastLogin || 'Recently'}</td>

                  <td style={{ textAlign: 'right' }}>
                    {isAdmin && !isCurrentUser ? (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button onClick={() => handleRoleToggle(u.id, u.role)} className="btn-saas btn-outline-white" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                          Switch Role
                        </button>
                        <button onClick={() => handleDeleteUser(u.id)} className="btn-saas btn-outline-white" style={{ padding: '4px 8px', color: '#f43f5e' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {isCurrentUser ? 'Active Session' : 'Protected'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Register Modal */}
      {isRegisterModalOpen && (
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
        }} onClick={() => setIsRegisterModalOpen(false)}>
          <div className="saas-card" style={{ maxWidth: '440px', width: '100%', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Register New Staff</h3>
              <button onClick={() => setIsRegisterModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Full Name *</label>
                <input type="text" className="saas-input" required value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Email Address *</label>
                <input type="email" className="saas-input" required value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Password *</label>
                <input type="password" className="saas-input" required value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Role</label>
                <select className="saas-select" value={registerForm.role} onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}>
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsRegisterModalOpen(false)} className="btn-saas btn-outline-white">Cancel</button>
                <button type="submit" className="btn-saas btn-dark">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
