// MedicationsPage.jsx
// Shows the patient's current medications and runs a simple hardcoded interaction check.

import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MedicationsPage.css';

export function MedicationsPage({ user, token, logout }) {
  const navigate = useNavigate();

  const [medList, setMedList] = useState([]);
  const [history, setHistory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState([]);

  // Hardcoded simple interaction pairs
  const interactionPairs = [
    ['warfarin', 'ibuprofen'],
    ['warfarin', 'aspirin'],
    ['warfarin', 'amiodarone'],
    ['digoxin', 'amiodarone'],
    ['digoxin', 'verapamil'],
    ['ace inhibitor', 'spironolactone'],
    ['ace inhibitor', 'potassium'],
    ['nsaid', 'blood pressure'],
  ];

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await axios.get('/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const profile = response.data.profile || {};
        const medsText = profile.current_medications || '';
        // split meds by comma or newline
        const meds = medsText
          .split(/\n|,/)
          .map((m) => m.trim())
          .filter(Boolean);

        setMedList(meds);
        setHistory(profile.previous_prescriptions || '');
        runInteractions(meds);
      } catch (requestError) {
        if (requestError.response?.status === 401) {
          logout();
          navigate('/login');
        } else {
          setError('Could not load medications.');
        }
      }
      setLoading(false);
    }

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function runInteractions(meds) {
    const foundWarnings = [];
    const lowerMeds = meds.map((m) => m.toLowerCase());

    interactionPairs.forEach(([a, b]) => {
      const hasA = lowerMeds.some((m) => m.includes(a));
      const hasB = lowerMeds.some((m) => m.includes(b));
      if (hasA && hasB) {
        foundWarnings.push(`Possible interaction between ${a} and ${b}. Monitor closely.`);
      }
    });

    setWarnings(foundWarnings);
  }

  if (loading) {
    return <div className="loading-text">Loading medications...</div>;
  }

  return (
    <div className="med-page">
      <div className="page-container">
        <nav className="med-nav">
          <Link to="/dashboard" className="med-brand">Life Link</Link>
          <div className="med-actions">
            <Link to="/dashboard" className="btn-secondary">Dashboard</Link>
            <button type="button" className="btn-primary" onClick={logout}>Logout</button>
          </div>
        </nav>

        <div className="med-card card">
          <p className="card-label">Current medications</p>
          {medList.length === 0 ? (
            <p>No medications saved yet.</p>
          ) : (
            <ul className="med-list">
              {medList.map((med, index) => (
                <li key={index}>{med}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="med-card card">
          <p className="card-label">Previous prescriptions / treatments</p>
          <p>{history || 'Not provided'}</p>
        </div>

        <div className="med-card card">
          <p className="card-label">Drug interaction checker (basic)</p>
          {warnings.length === 0 ? (
            <p className="good-text">No interactions found in the current list.</p>
          ) : (
            <ul className="warning-list">
              {warnings.map((w, index) => (
                <li key={index}>{w}</li>
              ))}
            </ul>
          )}
          <p className="helper-text">
            This checker is hardcoded and simple. Always double-check with a pharmacist.
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}
