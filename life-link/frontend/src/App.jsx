// App.jsx
// This is the top-level React component.
// I am storing the logged-in user and token here so every page can use them.

import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { LandingPage } from './pages/LandingPage/LandingPage';
import { RegisterPage } from './pages/RegisterPage/RegisterPage';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { DashboardPage } from './pages/DashboardPage/DashboardPage';
import { EditProfilePage } from './pages/EditProfilePage/EditProfilePage';
import { EmergencyPage } from './pages/EmergencyPage/EmergencyPage';
import { AccessLogPage } from './pages/AccessLogPage/AccessLogPage';
import { MedicationsPage } from './pages/MedicationsPage/MedicationsPage';
import { DocumentsPage } from './pages/DocumentsPage/DocumentsPage';
import { DoctorDocumentsPage } from './pages/DoctorDocumentsPage/DoctorDocumentsPage';

import './App.css';

function App() {
  const savedUser = localStorage.getItem('lifelink_user');
  const savedToken = localStorage.getItem('lifelink_token');

  const [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : null);
  const [token, setToken] = useState(savedToken || '');

  function handleLogin(userData, tokenData) {
    setUser(userData);
    setToken(tokenData);

    localStorage.setItem('lifelink_user', JSON.stringify(userData));
    localStorage.setItem('lifelink_token', tokenData);
  }

  function handleLogout() {
    setUser(null);
    setToken('');

    localStorage.removeItem('lifelink_user');
    localStorage.removeItem('lifelink_token');
  }

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<LandingPage user={user} logout={handleLogout} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage login={handleLogin} />} />
        <Route path="/emergency" element={<EmergencyPage />} />

        <Route
          path="/dashboard"
          element={
            user && token ? (
              <DashboardPage user={user} token={token} logout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/edit-profile"
          element={
            user && token ? (
              <EditProfilePage user={user} token={token} logout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/access-log"
          element={
            user && token ? (
              <AccessLogPage user={user} token={token} logout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/medications"
          element={
            user && token ? (
              <MedicationsPage user={user} token={token} logout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/documents"
          element={
            user && token ? (
              <DocumentsPage user={user} token={token} logout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="/doctor-documents" element={<DoctorDocumentsPage />} />
      </Routes>
    </div>
  );
}

export default App;
