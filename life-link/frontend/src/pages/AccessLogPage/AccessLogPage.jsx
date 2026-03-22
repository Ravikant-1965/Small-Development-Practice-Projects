// AccessLogPage.jsx
// This page shows the patient who accessed their emergency profile and when.

import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AccessLogPage.css';

export function AccessLogPage({ user, token, logout }) {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadLogs() {
      try {
        const response = await axios.get('/api/access-log', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setLogs(response.data);
      } catch (requestError) {
        if (requestError.response?.status === 401) {
          logout();
          navigate('/login');
        } else {
          setError('Could not load access logs.');
        }
      }

      setLoading(false);
    }

    loadLogs();
  }, [token, logout, navigate]);

  function formatDate(dateValue) {
    return new Date(dateValue).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (loading) {
    return <div className="loading-text">Loading access logs...</div>;
  }

  return (
    <div className="access-log-page">
      <div className="page-container">
        <nav className="access-nav">
          <Link to="/dashboard" className="dashboard-brand">Life Link</Link>

          <div className="dashboard-nav-links">
            <Link to="/dashboard" className="btn-secondary">Dashboard</Link>
            <button type="button" className="btn-primary" onClick={logout}>Logout</button>
          </div>
        </nav>

        <div className="access-log-wrapper">
          <div className="access-log-header card wide-card">
            <div>
              <p className="card-label">Privacy trail</p>
              <h1>Profile Access Log</h1>
              <p>
                This page shows who accessed your emergency profile for Health ID <strong>{user.healthId}</strong>.
              </p>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {logs.length === 0 ? (
            <div className="empty-log-card card">
              <h2>No access records yet</h2>
              <p>When someone opens your emergency profile, the record will appear here.</p>
            </div>
          ) : (
            <div className="log-list">
              {logs.map((log) => (
                <div className="log-item card" key={log.id}>
                  <p><strong>Accessed By:</strong> {log.accessed_by || 'Anonymous emergency visitor'}</p>
                  <p><strong>Hospital:</strong> {log.hospital_name || 'Not provided'}</p>
                  <p><strong>Address:</strong> {log.hospital_address || 'Not provided'}</p>
                  <p><strong>Pincode:</strong> {log.pincode || 'Not provided'}</p>
                  <p><strong>Date and Time:</strong> {formatDate(log.accessed_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
