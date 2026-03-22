// DoctorDocumentsPage.jsx — doctors can view uploaded files for a patient Health ID

import axios from 'axios';
import { useEffect, useState } from 'react';
import './DoctorDocumentsPage.css';

export function DoctorDocumentsPage() {
  const [healthId, setHealthId] = useState('');
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState('');

  const doctorToken = localStorage.getItem('lifelink_doctor_token');

  async function loadDocs() {
    if (!doctorToken) {
      setError('Doctor login required. Please login on the Emergency page.');
      return;
    }
    if (!healthId.trim()) {
      setError('Enter a Health ID.');
      return;
    }
    setError('');
    try {
      const response = await axios.get(`/api/doctor/documents/${healthId.trim()}`, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      setDocs(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load documents.');
    }
  }

  useEffect(() => {
    // if doctor opens with ?healthId=
    const params = new URLSearchParams(window.location.search);
    const hid = params.get('healthId');
    if (hid) {
      setHealthId(hid);
      loadDocs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="docdoc-page">
      <div className="page-container">
        <div className="docdoc-card card">
          <h1>Doctor Document Viewer</h1>
          <p>Enter patient Health ID to see uploaded files.</p>
          <div className="docdoc-row">
            <input
              className="form-input"
              placeholder="Example: LL-ABCDE"
              value={healthId}
              onChange={(e) => setHealthId(e.target.value.toUpperCase())}
            />
            <button className="btn-primary" onClick={loadDocs}>View Documents</button>
          </div>
          {error && <div className="error-message" style={{ marginTop: 10 }}>{error}</div>}
        </div>

        {docs.length > 0 && (
          <div className="docdoc-card card">
            <p className="card-label">Files for {healthId}</p>
            <ul className="docdoc-list">
              {docs.map((doc) => (
                <li key={doc.id}>
                  <span>{doc.original_name}</span>
                  <a className="btn-secondary small-btn" href={`/api/documents/file/${doc.id}`}>Download</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
