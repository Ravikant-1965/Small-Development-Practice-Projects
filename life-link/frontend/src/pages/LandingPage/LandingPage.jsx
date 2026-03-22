// LandingPage.jsx
// This is the home page for the project.
// It explains the idea in simple words and gives links to the main pages.

import { Link } from 'react-router-dom';
import './LandingPage.css';

export function LandingPage({ user, logout }) {
  return (
    <div className="landing-page">
      <div className="page-container">
        <nav className="landing-nav">
          <Link to="/" className="brand-name">Life Link</Link>
        </nav>
      </div>

      <section className="hero-section">
        <div className="page-container landing-grid">
          <div className="hero-left">
            <p className="hero-quote">“In emergencies, information is not convenience—it is survival.”</p>
            <p className="hero-text">
              Keep your Critical health details ready for the golden hour. &nbsp;
              Create a simple profile once and share a Health ID.
            </p>

            <div className="hero-buttons">
              <Link to="/register" className="btn-primary">Create Patient Account</Link>
            </div>
          </div>

          <div className="hero-right card login-tile">
            <div className="login-buttons">
              <Link to="/emergency" className="btn-primary">Doctor Login</Link>
              <Link to="/login" className="btn-secondary">Patient Login</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="page-container info-grid">
          <div className="info-card card">
            <h2>For Patients</h2>
            <p>Register, login, and keep your emergency profile updated in one place.</p>
          </div>
          <div className="info-card card">
            <h2>For Doctors</h2>
            <p>Use the public emergency page to search by Health ID. No account needed.</p>
          </div>
          <div className="info-card card">
            <h2>For Safety</h2>
            <p>Every emergency view is recorded in your access log for transparency.</p>
          </div>
        </div>
      </section>

      <section className="steps-section">
        <div className="page-container">
          <h2>How Life Link Works</h2>
          <div className="steps-grid">
            <div className="step-box card">
              <span>1</span>
              <p>Create your account and save your emergency health profile.</p>
            </div>
            <div className="step-box card">
              <span>2</span>
              <p>Get a unique Health ID and a QR code.</p>
            </div>
            <div className="step-box card">
              <span>3</span>
              <p>Emergency responders can access your profile instantly when needed.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
