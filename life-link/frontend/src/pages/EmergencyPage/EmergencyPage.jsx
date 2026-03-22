// EmergencyPage.jsx
// This is the public emergency lookup page.
// No login is required here, because the point is fast access in emergencies.

import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './EmergencyPage.css';

export function EmergencyPage() {
  const [searchParams] = useSearchParams();

  const [healthId, setHealthId] = useState('');
  const [accessedBy, setAccessedBy] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const savedDoctor = localStorage.getItem('lifelink_doctor');
  const savedDoctorToken = localStorage.getItem('lifelink_doctor_token');
  const [doctor, setDoctor] = useState(savedDoctor ? JSON.parse(savedDoctor) : null);
  const [doctorToken, setDoctorToken] = useState(savedDoctorToken || '');
  const [docEmail, setDocEmail] = useState('');
  const [docPassword, setDocPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [autoLaunch, setAutoLaunch] = useState(false);
  const [doctorDocs, setDoctorDocs] = useState([]);
  const [docError, setDocError] = useState('');

  useEffect(() => {
    const urlHealthId = searchParams.get('healthId');
    const urlAccessedBy = searchParams.get('accessedBy');
    const urlHospitalName = searchParams.get('hospitalName');
    const urlHospitalAddress = searchParams.get('hospitalAddress');
    const urlPincode = searchParams.get('pincode');
    const urlAuto = searchParams.get('auto') === '1';

    if (urlHealthId) setHealthId(urlHealthId.toUpperCase());
    if (urlAccessedBy) setAccessedBy(urlAccessedBy);
    if (urlHospitalName) setHospitalName(urlHospitalName);
    if (urlHospitalAddress) setHospitalAddress(urlHospitalAddress);
    if (urlPincode) setPincode(urlPincode);
    setAutoLaunch(urlAuto);

    if (urlHealthId && doctorToken && urlAuto) {
      searchPatient(
        urlHealthId.toUpperCase(),
        urlAccessedBy || accessedBy,
        urlHospitalName || hospitalName,
        urlHospitalAddress || hospitalAddress,
        urlPincode || pincode,
        true
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, doctorToken]);

  useEffect(() => {
    if (!doctorToken) {
      setPatientData(null);
    }
  }, [doctorToken]);

  async function searchPatient(
    customHealthId,
    customAccessedBy,
    customHospitalName,
    customHospitalAddress,
    customPincode,
    skipNewTab = false
  ) {
    if (!doctorToken) {
      setError('Doctor login required.');
      return;
    }
    const finalHealthId = (customHealthId || healthId).trim().toUpperCase();
    const finalAccessedBy = (customAccessedBy || accessedBy).trim();
    // accessLocation removed to simplify required fields
    const finalHospitalName = (customHospitalName || hospitalName).trim();
    const finalHospitalAddress = (customHospitalAddress || hospitalAddress).trim();
    const finalPincode = (customPincode || pincode).trim();

    if (!finalHealthId) {
      setError('Please enter a valid Health ID.');
      return;
    }
    if (!finalAccessedBy) {
      setError('Please enter who is accessing (name/title).');
      return;
    }

    if (!finalHospitalName || !finalHospitalAddress || !finalPincode) {
      setError('Hospital name, address, and pincode are required.');
      return;
    }

    // Stay in the same tab: just load data and scroll down.

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/emergency-access', {
        healthId: finalHealthId,
        accessedBy: finalAccessedBy,
        hospitalName: finalHospitalName,
        hospitalAddress: finalHospitalAddress,
        pincode: finalPincode
      }, {
        headers: {
          Authorization: `Bearer ${doctorToken}`
        }
      });

      setPatientData(response.data);
      setTimeout(() => {
        document.getElementById('patient-profile-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (requestError) {
      setPatientData(null);
      setError(requestError.response?.data?.message || 'Could not load the emergency profile.');
    }

    setLoading(false);

    // Load documents for doctor view
    if (!skipNewTab) {
      try {
        const responseDocs = await axios.get(`/api/doctor/documents/${finalHealthId}`, {
          headers: { Authorization: `Bearer ${doctorToken}` }
        });
        setDoctorDocs(responseDocs.data || []);
        setDocError('');
      } catch (e) {
        setDocError('Could not load documents for this patient.');
      }
    }
  }

  async function handleDoctorLogin(event) {
    event.preventDefault();
    if (!docEmail || !docPassword) {
      setAuthError('Email and password are required.');
      return;
    }
    setAuthError('');
    setAuthLoading(true);
    try {
      const response = await axios.post('/api/doctor/login', {
        email: docEmail,
        password: docPassword
      });
      setDoctor(response.data.doctor);
      setDoctorToken(response.data.token);
      localStorage.setItem('lifelink_doctor', JSON.stringify(response.data.doctor));
      localStorage.setItem('lifelink_doctor_token', response.data.token);
    } catch (loginError) {
      setAuthError(loginError.response?.data?.message || 'Doctor login failed.');
    }
    setAuthLoading(false);
  }

  function doctorLogout() {
    setDoctor(null);
    setDoctorToken('');
    localStorage.removeItem('lifelink_doctor');
    localStorage.removeItem('lifelink_doctor_token');
    setPatientData(null);
  }

  function handleSubmit(event) {
    event.preventDefault();
    searchPatient();
  }

  return (
    <div className="emergency-page">
      <div className="emergency-header">
        <div className="emergency-header-inner">
          <Link to="/" className="emergency-brand">Life Link</Link>
          <span className="emergency-label">Doctor Access</span>
        </div>
      </div>

      <div className="page-container emergency-wrapper">
        {!doctorToken ? (
          <form className="emergency-search-card card" onSubmit={handleDoctorLogin}>
            <div className="emergency-head">
              <div>
                <p className="card-label">Secure access</p>
                <h1>Doctor Login</h1>
                <p className="emergency-description">
                  Only authorized doctors can view emergency profiles. Use your hospital credentials.
                </p>
              </div>
            </div>

            {authError && <div className="error-message">{authError}</div>}

            <div className="form-group">
              <label>Doctor Email</label>
              <input
                type="email"
                className="form-input"
                value={docEmail}
                onChange={(e) => setDocEmail(e.target.value)}
                placeholder="doctor@lifelink.com"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-input"
                value={docPassword}
                onChange={(e) => setDocPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>

            <button type="submit" className="btn-danger emergency-search-button" disabled={authLoading}>
              {authLoading ? 'Signing in...' : 'Login as Doctor'}
            </button>
          </form>
        ) : (
          <>
            <div className="doctor-bar card">
              <div>
                <p className="card-label">Doctor signed in</p>
                <strong>{doctor?.name || 'Doctor'}</strong> — {doctor?.email || ''}
              </div>
              <div className="doctor-bar-actions">
                <Link
                  to={`/doctor-documents${healthId ? `?healthId=${healthId}` : ''}`}
                  className="btn-secondary"
                  target="_blank"
                  rel="noreferrer"
                >
                  View Documents
                </Link>
                <button type="button" className="btn-primary" onClick={doctorLogout}>Logout</button>
              </div>
            </div>

            <form className="emergency-search-card card" onSubmit={handleSubmit}>
              <div className="emergency-head">
                <div>
                  <p className="card-label">Doctors & paramedics</p>
                  <h1>Emergency Patient Lookup</h1>
                  <p className="emergency-description">
                    Enter the patient&apos;s Health ID. Access is logged against your doctor account.
                  </p>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="emergency-grid">
                <div className="form-group">
                  <label>Health ID</label>
                  <input
                    type="text"
                    className="form-input"
                    value={healthId}
                    onChange={(event) => setHealthId(event.target.value.toUpperCase())}
                    placeholder="Example: LL-A3X92"
                    maxLength={8}
                  />
                </div>

                <div className="form-group">
                  <label>Accessed By <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={accessedBy}
                    onChange={(event) => setAccessedBy(event.target.value)}
                    placeholder="Example: Dr. Sharma, EMT 12"
                  />
                </div>
              </div>

              {/* <div className="form-group">
                <label>Hospital / Ambulance / Place <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={accessLocation}
                  onChange={(event) => setAccessLocation(event.target.value)}
                  placeholder="Example: City Hospital Emergency Ward"
                />
              </div> */}

              <div className="form-group">
                <label>Hospital Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="Example: Samar Hospital"
                />
              </div>

              <div className="form-group">
                <label>Hospital Address <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={hospitalAddress}
                  onChange={(e) => setHospitalAddress(e.target.value)}
                  placeholder="Street, City"
                />
              </div>

              <div className="form-group">
                <label>Pincode <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 110027"
                />
              </div>

              <button type="submit" className="btn-danger emergency-search-button" disabled={loading}>
                {loading ? 'Opening Profile...' : 'Access Emergency Profile'}
              </button>
            </form>
          </>
        )}

        {patientData && (
          <div className="emergency-profile-card card" id="patient-profile-section">
            <div className="profile-top">
              <div>
                <h2>{patientData.user.name}</h2>
                <p className="patient-health-id">Health ID: {patientData.user.healthId}</p>
              </div>
              <p className="logged-text">Access logged</p>
            </div>

            <div className="critical-boxes">
              <div className="critical-box">
                <span>Blood Group</span>
                <strong>{patientData.profile.blood_group || 'Unknown'}</strong>
              </div>
              <div className="critical-box">
                <span>Allergies</span>
                <strong>{patientData.profile.allergies || 'None listed'}</strong>
              </div>
              <div className="critical-box">
                <span>Organ Donor</span>
                <strong>{patientData.profile.organ_donor_status || 'Not specified'}</strong>
              </div>
            </div>

            <div className="emergency-details-grid">
              <div className="detail-card">
                <span>Date of Birth</span>
                <strong>{patientData.profile.date_of_birth || 'Not added'}</strong>
              </div>
              <div className="detail-card">
                <span>Previous Prescriptions</span>
                <strong>{patientData.profile.previous_prescriptions || 'None listed'}</strong>
              </div>
              <div className="detail-card">
                <span>Chronic Conditions</span>
                <strong>{patientData.profile.chronic_conditions || 'None listed'}</strong>
              </div>
              <div className="detail-card">
                <span>Current Medications</span>
                <strong>{patientData.profile.current_medications || 'None listed'}</strong>
              </div>
              <div className="detail-card">
                <span>Previous Surgeries</span>
                <strong>{patientData.profile.previous_surgeries || 'None listed'}</strong>
              </div>
              <div className="detail-card">
                <span>Emergency Contact</span>
                <strong>
                  {patientData.profile.emergency_contact_name
                    ? `${patientData.profile.emergency_contact_name} - ${patientData.profile.emergency_contact_phone || 'No phone'}`
                    : 'Not added'}
                </strong>
              </div>
              <div className="detail-card">
                <span>Age</span>
                <strong>{patientData.profile.age || 'Not added'}</strong>
              </div>
              <div className="detail-card">
                <span>Weight</span>
                <strong>{patientData.profile.weight || 'Not added'}</strong>
              </div>
              <div className="detail-card">
                <span>Gender</span>
                <strong>{patientData.profile.gender || 'Not added'}</strong>
              </div>
              <div className="detail-card">
                <span>Chief Complaint</span>
                <strong>{patientData.profile.chief_complaint || 'Not added'}</strong>
              </div>
              <div className="detail-card">
                <span>Medical History</span>
                <strong>{patientData.profile.medical_history || 'Not added'}</strong>
              </div>
              <div className="detail-card">
                <span>Lab Results / Imaging</span>
                <strong>{patientData.profile.lab_results || 'Not added'}</strong>
              </div>
              <div className="detail-card">
                <span>Kidney Function</span>
                <strong>{patientData.profile.kidney_function || 'Not added'}</strong>
              </div>
              <div className="detail-card">
                <span>Liver Function</span>
                <strong>{patientData.profile.liver_function || 'Not added'}</strong>
              </div>
              <div className="detail-card">
                <span>Pregnancy / Breastfeeding</span>
                <strong>{patientData.profile.pregnancy_status || 'Not added'}</strong>
              </div>
              <div className="detail-card">
                <span>Family History</span>
                <strong>{patientData.profile.family_history || 'Not added'}</strong>
              </div>
              <div className="detail-card">
                <span>Substance Use</span>
                <strong>{patientData.profile.substance_use || 'Not added'}</strong>
              </div>
              <div className="detail-card">
                <span>Mental Health</span>
                <strong>{patientData.profile.mental_health || 'Not added'}</strong>
              </div>
              <div className="detail-card">
                <span>Previous Treatments</span>
                <strong>{patientData.profile.previous_treatments || 'Not added'}</strong>
              </div>
              <div className="detail-card">
                <span>Drug Interaction Warnings</span>
                <strong>{patientData.profile.interaction_warnings || 'Not added'}</strong>
              </div>
            </div>

            <div className="documents-section">
              <h3>Patient Documents</h3>
              {docError && <div className="error-message">{docError}</div>}
              {doctorDocs.length === 0 && !docError && <p>No documents uploaded.</p>}
              {doctorDocs.length > 0 && (
                <ul className="docdoc-list">
                  {doctorDocs.map((doc) => (
                    <li key={doc.id}>
                      <span>{doc.original_name}</span>
                      <a className="btn-secondary small-btn" href={`/api/documents/preview/${doc.id}`} target="_blank" rel="noreferrer">View</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
