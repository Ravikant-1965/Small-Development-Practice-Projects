// DashboardPage.jsx
// This is the main patient dashboard after login.
// It shows the Health ID, QR code, and a summary of the saved profile.

import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import './DashboardPage.css';

export function DashboardPage({ user, token, logout }) {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState([]);
  const [docsError, setDocsError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await axios.get('/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setProfile(response.data.profile);
      } catch (requestError) {
        if (requestError.response?.status === 401) {
          logout();
          navigate('/login');
        }
      }

      setLoading(false);
    }

    loadProfile();
  }, [token, logout, navigate]);

  useEffect(() => {
    async function loadDocs() {
      try {
        const response = await axios.get('/api/documents', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDocs(response.data || []);
      } catch (err) {
        setDocsError('Could not load documents.');
      }
    }
    loadDocs();
  }, [token]);

  const qrCodeValue = `${window.location.origin}/emergency?healthId=${user.healthId}`;

  if (loading) {
    return <div className="loading-text">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="page-container">
        <nav className="dashboard-nav">
          <Link to="/" className="dashboard-brand">Life Link</Link>

          <div className="dashboard-nav-links">
            <Link to="/access-log" className="btn-secondary">Access Log</Link>
            <button type="button" className="btn-primary" onClick={logout}>Logout</button>
          </div>
        </nav>

        <div className="dashboard-container">
          <div className="dashboard-welcome card">
            <div>
              <p className="card-label">Hi {user.name}</p>
              <h1>Keep your profile Updated for Doctors</h1>
            </div>
            <Link to="/edit-profile" className="btn-secondary">Update Profile</Link>
          </div>

          <div className="dashboard-top-grid">
            <div className="dashboard-card card">
              <p className="card-label">Your Unique Health ID</p>
              <h2 className="health-id-text">{user.healthId}</h2>
              <p className="card-note">
                Share this ID with family or save it as an ICE contact on your phone.
              </p>

              <div className="card-actions">
                <Link to="/edit-profile" className="btn-primary">
                  {profile ? 'Edit Profile' : 'Create Profile'}
                </Link>
                <Link to="/emergency" className="btn-secondary">Emergency Page</Link>
              </div>
            </div>

            <div className="dashboard-card card qr-card">
              <p className="card-label">Your QR Code</p>
              <div className="qr-box">
                <QRCodeSVG value={qrCodeValue} size={180} includeMargin />
              </div>
              <p className="card-note">Print or add to your lock-screen for quick scanning.</p>
            </div>
          </div>

          {profile ? (
            <div className="dashboard-card card summary-card">
              <div className="summary-head">
                <div>
                  <p className="card-label">Emergency Profile</p>
                  <h2>Snapshot doctors will see</h2>
                </div>
                <Link to="/edit-profile" className="btn-secondary">Edit</Link>
              </div>

              <div className="summary-grid">
                <div className="summary-item">
                  <span>Full Name</span>
                  <strong>{profile.full_name || 'Not added'}</strong>
                </div>
                <div className="summary-item">
                  <span>Date of Birth</span>
                  <strong>{profile.date_of_birth || 'Not added'}</strong>
                </div>
                <div className="summary-item">
                  <span>Blood Group</span>
                  <strong>{profile.blood_group || 'Not added'}</strong>
                </div>
                <div className="summary-item">
                  <span>Allergies</span>
                  <strong>{profile.allergies || 'None listed'}</strong>
                </div>
                <div className="summary-item">
                  <span>Previous Prescriptions</span>
                  <strong>{profile.previous_prescriptions || 'None listed'}</strong>
                </div>
                <div className="summary-item">
                  <span>Chronic Conditions</span>
                  <strong>{profile.chronic_conditions || 'None listed'}</strong>
                </div>
                <div className="summary-item">
                  <span>Current Medications</span>
                  <strong>{profile.current_medications || 'None listed'}</strong>
                </div>
                <div className="summary-item">
                  <span>Previous Surgeries</span>
                  <strong>{profile.previous_surgeries || 'None listed'}</strong>
                </div>
                <div className="summary-item">
                  <span>Emergency Contact</span>
                  <strong>
                    {profile.emergency_contact_name
                      ? `${profile.emergency_contact_name} - ${profile.emergency_contact_phone || 'No number'}`
                      : 'Not added'}
                  </strong>
                </div>
                <div className="summary-item">
                  <span>Organ Donor Status</span>
                  <strong>{profile.organ_donor_status || 'Not specified'}</strong>
                </div>
                <div className="summary-item">
                  <span>Age</span>
                  <strong>{profile.age || 'Not added'}</strong>
                </div>
                <div className="summary-item">
                  <span>Weight</span>
                  <strong>{profile.weight || 'Not added'}</strong>
                </div>
                <div className="summary-item">
                  <span>Gender</span>
                  <strong>{profile.gender || 'Not added'}</strong>
                </div>
                <div className="summary-item">
                  <span>Chief Complaint</span>
                  <strong>{profile.chief_complaint || 'Not added'}</strong>
                </div>
                <div className="summary-item">
                  <span>Medical History</span>
                  <strong>{profile.medical_history || 'Not added'}</strong>
                </div>
                <div className="summary-item">
                  <span>Lab Results / Imaging</span>
                  <strong>{profile.lab_results || 'Not added'}</strong>
                </div>
                <div className="summary-item">
                  <span>Kidney Function</span>
                  <strong>{profile.kidney_function || 'Not added'}</strong>
                </div>
                <div className="summary-item">
                  <span>Liver Function</span>
                  <strong>{profile.liver_function || 'Not added'}</strong>
                </div>
                <div className="summary-item">
                  <span>Pregnancy / Breastfeeding Status</span>
                  <strong>{profile.pregnancy_status || 'Not added'}</strong>
                </div>
                <div className="summary-item">
                  <span>Family History</span>
                  <strong>{profile.family_history || 'Not added'}</strong>
                </div>
                <div className="summary-item">
                  <span>Substance Use</span>
                  <strong>{profile.substance_use || 'Not added'}</strong>
                </div>
                <div className="summary-item">
                  <span>Mental Health Status</span>
                  <strong>{profile.mental_health || 'Not added'}</strong>
                </div>
                <div className="summary-item">
                  <span>Previous Treatments / Outcomes</span>
                  <strong>{profile.previous_treatments || 'Not added'}</strong>
                </div>
                <div className="summary-item">
                  <span>Drug Interaction Warnings</span>
                  <strong>{profile.interaction_warnings || 'Not added'}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="dashboard-card card empty-card">
              <h2>Your emergency profile is still empty</h2>
              <p>
                Add your blood group, allergies, medications, and emergency contact so the
                system can actually help during an emergency.
              </p>
              <Link to="/edit-profile" className="btn-primary">Fill My Profile</Link>
            </div>
          )}

          <div className="dashboard-card card extras-card">
            <div className="summary-head">
              <div>
                <p className="card-label">More tools</p>
                <h2>Medications & Documents</h2>
              </div>
            </div>
            <div className="extras-buttons">
              <Link to="/medications" className="btn-secondary">View Medications & Interactions</Link>
              <Link to="/documents" className="btn-primary">Upload / View Documents</Link>
            </div>

            <div className="doc-quick-list">
              <p className="card-label">Recent documents</p>
              {docsError && <div className="error-message">{docsError}</div>}
              {(!docs || docs.length === 0) && !docsError && <p>No documents uploaded yet.</p>}
              {docs && docs.length > 0 && (
                <ul>
                  {docs.slice(0, 3).map((doc) => (
                    <li key={doc.id}>
                      <span>{doc.original_name}</span>
                      <div className="doc-quick-actions">
                        <a className="btn-secondary small-btn" href={`/api/documents/preview/${doc.id}`} target="_blank" rel="noreferrer">View</a>
                        <button
                          type="button"
                          className="btn-danger small-btn"
                          onClick={async () => {
                            if (!window.confirm('Delete this document?')) return;
                            try {
                              await axios.delete(`/api/documents/${doc.id}`, {
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              setDocs((prev) => prev.filter((d) => d.id !== doc.id));
                            } catch {
                              setDocsError('Could not delete file.');
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
