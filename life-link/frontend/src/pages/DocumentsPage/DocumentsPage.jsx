// DocumentsPage.jsx — patient uploads and views their medical documents

import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './DocumentsPage.css';

export function DocumentsPage({ user, token, logout }) {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function loadDocs() {
    try {
      const response = await axios.get('/api/documents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocs(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        logout(); navigate('/login');
      } else {
        setError('Could not load documents.');
      }
    }
  }

  useEffect(() => { loadDocs(); }, []); // run once

  async function handleUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post('/api/documents', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      await loadDocs();
    } catch (err) {
      setError('Upload failed.');
    }
    setUploading(false);
  }

  return (
    <div className="docs-page">
      <div className="page-container">
        <nav className="docs-nav">
          <Link to="/dashboard" className="docs-brand">Life Link</Link>
          <div className="docs-actions">
            <Link to="/dashboard" className="btn-secondary">Dashboard</Link>
            <button type="button" className="btn-primary" onClick={logout}>Logout</button>
          </div>
        </nav>

        <div className="docs-card card">
          <p className="card-label">Upload medical document (PDF / image)</p>
          <input type="file" onChange={handleUpload} accept=".pdf,image/*" />
          {uploading && <p>Uploading...</p>}
          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="docs-card card">
          <p className="card-label">Your uploaded documents</p>
          {docs.length === 0 ? (
            <p>No documents yet.</p>
          ) : (
            <ul className="doc-list">
              {docs.map((doc) => (
                <li key={doc.id}>
                  <span>{doc.original_name}</span>
                  <div className="doc-actions">
                    <a
                      href={`/api/documents/preview/${doc.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary small-btn"
                    >
                      View
                    </a>
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
                        } catch (err) {
                          setError('Could not delete file.');
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
  );
}
