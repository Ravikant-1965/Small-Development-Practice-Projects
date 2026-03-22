// LoginPage.jsx
// Patient login page.

import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../RegisterPage/RegisterPage.css';

export function LoginPage({ login }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/login', {
        email,
        password
      });

      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not login right now.');
    }

    setLoading(false);
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <Link to="/" className="auth-logo">Life Link</Link>
        <h1>Patient Login</h1>
        <p className="auth-subtitle">Login to view your Health ID, QR code, and access log.</p>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" className="btn-primary auth-button" disabled={loading}>
          {loading ? 'Logging In...' : 'Login'}
        </button>

        <p className="auth-footer">
          Need a new account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
}
