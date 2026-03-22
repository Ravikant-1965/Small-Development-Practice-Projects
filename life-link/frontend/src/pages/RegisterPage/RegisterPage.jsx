// RegisterPage.jsx
// Simple patient account registration page.

import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterPage.css';

export function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name || !email || !password) {
      setError('Please fill in all the fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/api/register', {
        name,
        email,
        password
      });

      setSuccess(`Account created. Your Health ID is ${response.data.healthId}. Redirecting to login...`);
      setShowSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 1800);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not register right now.');
    }

    setLoading(false);
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <Link to="/" className="auth-logo">Life Link</Link>
        <h1>Create Patient Account</h1>
        <p className="auth-subtitle">Get your Life Link Health ID and start your emergency profile.</p>

        {error && <div className="error-message">{error}</div>}
        {showSuccess && (
          <div className="success-message">
            <span>{success}</span>
            <button
              type="button"
              className="alert-close"
              onClick={() => setShowSuccess(false)}
              aria-label="Close success message"
            >
              ×
            </button>
          </div>
        )}

        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your full name"
          />
        </div>

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
            <div className="password-row">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="password-row">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter password"
              />
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary auth-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
}
