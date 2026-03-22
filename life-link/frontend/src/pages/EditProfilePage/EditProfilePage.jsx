// EditProfilePage.jsx
// This page lets the patient create or update the emergency health profile.

import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './EditProfilePage.css';

export function EditProfilePage({ token, logout }) {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [allergies, setAllergies] = useState('');
  const [previousPrescriptions, setPreviousPrescriptions] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [previousSurgeries, setPreviousSurgeries] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [organDonorStatus, setOrganDonorStatus] = useState('Not specified');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [labResults, setLabResults] = useState('');
  const [kidneyFunction, setKidneyFunction] = useState('');
  const [liverFunction, setLiverFunction] = useState('');
  const [pregnancyStatus, setPregnancyStatus] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');
  const [substanceUse, setSubstanceUse] = useState('');
  const [mentalHealth, setMentalHealth] = useState('');
  const [previousTreatments, setPreviousTreatments] = useState('');
  const [interactionWarnings, setInteractionWarnings] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await axios.get('/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.profile) {
          const profile = response.data.profile;

          setFullName(profile.full_name || '');
          setDateOfBirth(profile.date_of_birth || '');
          setBloodGroup(profile.blood_group || '');
          setAllergies(profile.allergies || '');
          setPreviousPrescriptions(profile.previous_prescriptions || '');
          setChronicConditions(profile.chronic_conditions || '');
          setCurrentMedications(profile.current_medications || '');
          setPreviousSurgeries(profile.previous_surgeries || '');
          setEmergencyContactName(profile.emergency_contact_name || '');
          setEmergencyContactPhone(profile.emergency_contact_phone || '');
          setOrganDonorStatus(profile.organ_donor_status || 'Not specified');
          setAge(profile.age || '');
          setWeight(profile.weight || '');
          setGender(profile.gender || '');
          setChiefComplaint(profile.chief_complaint || '');
          setMedicalHistory(profile.medical_history || '');
          setLabResults(profile.lab_results || '');
          setKidneyFunction(profile.kidney_function || '');
          setLiverFunction(profile.liver_function || '');
          setPregnancyStatus(profile.pregnancy_status || '');
          setFamilyHistory(profile.family_history || '');
          setSubstanceUse(profile.substance_use || '');
          setMentalHealth(profile.mental_health || '');
          setPreviousTreatments(profile.previous_treatments || '');
          setInteractionWarnings(profile.interaction_warnings || '');
        }
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

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(
        '/api/profile',
        {
          fullName,
          dateOfBirth,
          bloodGroup,
          allergies,
          previousPrescriptions,
          chronicConditions,
          currentMedications,
          previousSurgeries,
          emergencyContactName,
          emergencyContactPhone,
          organDonorStatus,
          age,
          weight,
          gender,
          chiefComplaint,
          medicalHistory,
          labResults,
          kidneyFunction,
          liverFunction,
          pregnancyStatus,
          familyHistory,
          substanceUse,
          mentalHealth,
          previousTreatments,
          interactionWarnings
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess('Health profile saved successfully.');

      setTimeout(() => {
        navigate('/dashboard');
      }, 1300);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save the profile.');
    }

    setSaving(false);
  }

  if (loading) {
    return <div className="loading-text">Loading profile form...</div>;
  }

  return (
    <div className="edit-profile-page">
      <div className="page-container">
        <nav className="form-nav">
          <Link to="/dashboard" className="dashboard-brand">Life Link</Link>
          <Link to="/dashboard" className="btn-secondary">Back to Dashboard</Link>
        </nav>

        <div className="edit-profile-wrapper">
          <form className="profile-card card" onSubmit={handleSubmit}>
            <h1>Edit Emergency Health Profile</h1>
            <p className="profile-subtitle">
              This information will be shown on the public emergency access page.
            </p>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="two-column-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  className="form-input"
                  value={dateOfBirth}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                />
              </div>
            </div>

            <div className="two-column-row">
              <div className="form-group">
                <label>Blood Group</label>
                <select
                  className="form-input"
                  value={bloodGroup}
                  onChange={(event) => setBloodGroup(event.target.value)}
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
            </div>

            <div className="form-group">
              <label>Organ Donor Status</label>
              <select
                className="form-input"
                value={organDonorStatus}
                onChange={(event) => setOrganDonorStatus(event.target.value)}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Not specified">Not specified</option>
              </select>
            </div>
          </div>

          <div className="two-column-row">
            <div className="form-group">
              <label>Age</label>
              <input className="form-input" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Weight (kg)</label>
              <input className="form-input" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Gender</label>
            <input className="form-input" value={gender} onChange={(e) => setGender(e.target.value)} />
          </div>

            <div className="form-group">
              <label>Allergies</label>
              <textarea
                className="form-input big-textarea"
                value={allergies}
                onChange={(event) => setAllergies(event.target.value)}
                placeholder="Example: Penicillin, peanuts"
              />
            </div>

            <div className="form-group">
              <label>Previous Prescriptions</label>
              <textarea
                className="form-input big-textarea"
                value={previousPrescriptions}
                onChange={(event) => setPreviousPrescriptions(event.target.value)}
              />
            </div>

          <div className="form-group">
            <label>Chronic Conditions</label>
            <textarea
              className="form-input big-textarea"
              value={chronicConditions}
                onChange={(event) => setChronicConditions(event.target.value)}
                placeholder="Example: Diabetes, asthma"
              />
          </div>

          <div className="form-group">
            <label>Chief Complaint</label>
            <textarea
              className="form-input big-textarea"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="Main reason for visit"
            />
          </div>

          <div className="form-group">
            <label>Medical History (past illnesses, surgeries, chronic conditions)</label>
            <textarea
              className="form-input big-textarea"
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Lab Results / Imaging</label>
            <textarea
              className="form-input big-textarea"
              value={labResults}
              onChange={(e) => setLabResults(e.target.value)}
            />
          </div>

          <div className="two-column-row">
            <div className="form-group">
              <label>Kidney Function</label>
              <input className="form-input" value={kidneyFunction} onChange={(e) => setKidneyFunction(e.target.value)} placeholder="e.g. eGFR 55" />
            </div>
            <div className="form-group">
              <label>Liver Function</label>
              <input className="form-input" value={liverFunction} onChange={(e) => setLiverFunction(e.target.value)} placeholder="e.g. ALT/AST values" />
            </div>
          </div>

          <div className="two-column-row">
            <div className="form-group">
              <label>Pregnancy / Breastfeeding Status</label>
              <input className="form-input" value={pregnancyStatus} onChange={(e) => setPregnancyStatus(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Family History</label>
              <input className="form-input" value={familyHistory} onChange={(e) => setFamilyHistory(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Substance Use (alcohol, tobacco, recreational drugs)</label>
            <textarea className="form-input big-textarea" value={substanceUse} onChange={(e) => setSubstanceUse(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Mental Health Status</label>
            <textarea className="form-input big-textarea" value={mentalHealth} onChange={(e) => setMentalHealth(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Previous Treatments & Outcomes</label>
            <textarea className="form-input big-textarea" value={previousTreatments} onChange={(e) => setPreviousTreatments(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Drug Interaction Warnings (note any flags)</label>
            <textarea className="form-input big-textarea" value={interactionWarnings} onChange={(e) => setInteractionWarnings(e.target.value)} />
          </div>

            <div className="form-group">
              <label>Current Medications</label>
              <textarea
                className="form-input big-textarea"
                value={currentMedications}
                onChange={(event) => setCurrentMedications(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Previous Surgeries</label>
              <textarea
                className="form-input big-textarea"
                value={previousSurgeries}
                onChange={(event) => setPreviousSurgeries(event.target.value)}
              />
            </div>

            <div className="two-column-row">
              <div className="form-group">
                <label>Emergency Contact Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={emergencyContactName}
                  onChange={(event) => setEmergencyContactName(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Emergency Contact Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={emergencyContactPhone}
                  onChange={(event) => setEmergencyContactPhone(event.target.value)}
                />
              </div>
            </div>

            <div className="profile-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              <Link to="/dashboard" className="btn-secondary">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
