// server.js
// This is the Express server for the Life Link project.
// It handles register/login, saving medical profiles, emergency access,
// and the access log that patients can review later.

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { initDatabase, getDb } = require('./database');

const app = express();
const PORT = 3001;
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}
const upload = multer({ dest: UPLOAD_DIR });

// Change this later before deploying.
const JWT_SECRET = 'Temp-Ravi-Ruchiaanchalgungun';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

// Small console logger so it is easy to see requests while learning.
app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

initDatabase();

function generateHealthId() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let healthId = 'LL-';

    for (let i = 0; i < 5; i += 1) {
        const randomIndex = Math.floor(Math.random() * letters.length);
        healthId += letters[randomIndex];
    }

    return healthId;
}

function createUniqueHealthId() {
    const db = getDb();
    let healthId = generateHealthId();

    while (db.prepare('SELECT id FROM users WHERE health_id = ?').get(healthId)) {
        healthId = generateHealthId();
    }

    return healthId;
}

function checkAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'Please login first.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ message: 'Token is missing.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).send({ message: 'Your login session is not valid anymore.' });
    }
}

// Middleware specifically for doctor access to emergency route
function checkDoctorAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Doctor login required.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'doctor') {
            return res.status(403).send({ message: 'Doctor permission required.' });
        }
        req.doctorId = decoded.doctorId;
        next();
    } catch (error) {
        return res.status(401).send({ message: 'Invalid or expired doctor session.' });
    }
}

function findPatientByHealthId(healthId) {
    const db = getDb();
    const cleanHealthId = String(healthId || '').trim().toUpperCase();

    const user = db.prepare(
        'SELECT id, name, email, health_id FROM users WHERE health_id = ?'
    ).get(cleanHealthId);

    if (!user) {
        return { error: 'No patient was found with that Health ID.' };
    }

    const profile = db.prepare(
        'SELECT * FROM profiles WHERE user_id = ?'
    ).get(user.id);

    if (!profile) {
        return { error: 'This patient has an account, but they have not saved an emergency profile yet.' };
    }

    return { user, profile };
}

app.get('/api/health', (req, res) => {
    res.send({ message: 'Life Link backend is running.' });
});

app.post('/api/register', (req, res) => {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!name || !email || !password) {
        return res.status(400).send({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
        return res.status(400).send({ message: 'Password must be at least 6 characters long.' });
    }

    const db = getDb();
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

    if (existingUser) {
        return res.status(400).send({ message: 'That email is already registered. Please login instead.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const healthId = createUniqueHealthId();

    db.prepare(
        'INSERT INTO users (name, email, password_hash, health_id) VALUES (?, ?, ?, ?)'
    ).run(name, email, passwordHash, healthId);

    res.status(201).send({
        message: 'Account created successfully.',
        healthId
    });
});

app.post('/api/login', (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
        return res.status(400).send({ message: 'Email and password are required.' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
        return res.status(401).send({ message: 'Invalid email or password.' });
    }

    const passwordMatches = bcrypt.compareSync(password, user.password_hash);

    if (!passwordMatches) {
        return res.status(401).send({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.send({
        message: 'Login successful.',
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            healthId: user.health_id
        }
    });
});

// Doctor login (simple demo auth)
app.post('/api/doctor/login', (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
        return res.status(400).send({ message: 'Email and password are required.' });
    }

    const db = getDb();
    const doctor = db.prepare('SELECT * FROM doctors WHERE email = ?').get(email);

    if (!doctor || doctor.password_plain !== password) {
        return res.status(401).send({ message: 'Invalid doctor credentials.' });
    }

    const token = jwt.sign(
        { doctorId: doctor.id, role: 'doctor' },
        JWT_SECRET,
        { expiresIn: '12h' }
    );

    res.send({
        message: 'Doctor login successful.',
        token,
        doctor: {
            id: doctor.id,
            name: doctor.name,
            email: doctor.email
        }
    });
});

app.get('/api/profile', checkAuth, (req, res) => {
    const db = getDb();

    const user = db.prepare(
        'SELECT id, name, email, health_id FROM users WHERE id = ?'
    ).get(req.userId);

    const profile = db.prepare(
        'SELECT * FROM profiles WHERE user_id = ?'
    ).get(req.userId);

    res.send({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            healthId: user.health_id
        },
        profile: profile || null
    });
});

app.post('/api/profile', checkAuth, (req, res) => {
    const {
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
    } = req.body;

    const db = getDb();
    const existingProfile = db.prepare(
        'SELECT id FROM profiles WHERE user_id = ?'
    ).get(req.userId);

    if (existingProfile) {
        db.prepare(`
            UPDATE profiles
            SET
                full_name = ?,
                date_of_birth = ?,
                blood_group = ?,
                allergies = ?,
                previous_prescriptions = ?,
                chronic_conditions = ?,
                current_medications = ?,
                previous_surgeries = ?,
                emergency_contact_name = ?,
                emergency_contact_phone = ?,
                organ_donor_status = ?,
                age = ?,
                weight = ?,
                gender = ?,
                chief_complaint = ?,
                medical_history = ?,
                lab_results = ?,
                kidney_function = ?,
                liver_function = ?,
                pregnancy_status = ?,
                family_history = ?,
                substance_use = ?,
                mental_health = ?,
                previous_treatments = ?,
                interaction_warnings = ?,
                updated_at = ?
            WHERE user_id = ?
        `).run(
            fullName || '',
            dateOfBirth || '',
            bloodGroup || '',
            allergies || '',
            previousPrescriptions || '',
            chronicConditions || '',
            currentMedications || '',
            previousSurgeries || '',
            emergencyContactName || '',
            emergencyContactPhone || '',
            organDonorStatus || 'Not specified',
            age || '',
            weight || '',
            gender || '',
            chiefComplaint || '',
            medicalHistory || '',
            labResults || '',
            kidneyFunction || '',
            liverFunction || '',
            pregnancyStatus || '',
            familyHistory || '',
            substanceUse || '',
            mentalHealth || '',
            previousTreatments || '',
            interactionWarnings || '',
            new Date().toISOString(),
            req.userId
        );
    } else {
        db.prepare(`
            INSERT INTO profiles (
                user_id,
                full_name,
                date_of_birth,
                blood_group,
                allergies,
                previous_prescriptions,
                chronic_conditions,
                current_medications,
                previous_surgeries,
                emergency_contact_name,
                emergency_contact_phone,
                organ_donor_status,
                age,
                weight,
                gender,
                chief_complaint,
                medical_history,
                lab_results,
                kidney_function,
                liver_function,
                pregnancy_status,
                family_history,
                substance_use,
                mental_health,
                previous_treatments,
                interaction_warnings,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            req.userId,
            fullName || '',
            dateOfBirth || '',
            bloodGroup || '',
            allergies || '',
            previousPrescriptions || '',
            chronicConditions || '',
            currentMedications || '',
            previousSurgeries || '',
            emergencyContactName || '',
            emergencyContactPhone || '',
            organDonorStatus || 'Not specified',
            age || '',
            weight || '',
            gender || '',
            chiefComplaint || '',
            medicalHistory || '',
            labResults || '',
            kidneyFunction || '',
            liverFunction || '',
            pregnancyStatus || '',
            familyHistory || '',
            substanceUse || '',
            mentalHealth || '',
            previousTreatments || '',
            interactionWarnings || '',
            new Date().toISOString()
        );
    }

    res.send({ message: 'Health profile saved successfully.' });
});

// Public emergency access:
// No login is needed here. A doctor or responder can search by Health ID.
app.post('/api/emergency-access', checkDoctorAuth, (req, res) => {
    const healthId = String(req.body.healthId || '').trim().toUpperCase();
    const accessedBy = String(req.body.accessedBy || '').trim();
    const accessLocation = String(req.body.accessLocation || '').trim();
    const hospitalName = String(req.body.hospitalName || '').trim();
    const hospitalAddress = String(req.body.hospitalAddress || '').trim();
    const pincode = String(req.body.pincode || '').trim();

    if (!healthId) {
        return res.status(400).send({ message: 'Health ID is required.' });
    }
    if (!accessedBy) {
        return res.status(400).send({ message: 'Accessed By is required.' });
    }
    if (!hospitalName || !hospitalAddress || !pincode) {
        return res.status(400).send({ message: 'Hospital name, address, and pincode are required.' });
    }

    const patientResult = findPatientByHealthId(healthId);

    if (patientResult.error) {
        return res.status(404).send({ message: patientResult.error });
    }

    const db = getDb();

    const doctor = db.prepare('SELECT name, email FROM doctors WHERE id = ?').get(req.doctorId);
    const doctorLabel = doctor ? `${doctor.name} (${doctor.email})` : 'Unknown doctor';

    db.prepare(`
        INSERT INTO access_logs (health_id, accessed_by, access_location, hospital_name, hospital_address, pincode, accessed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
        patientResult.user.health_id,
        accessedBy || doctorLabel,
        accessLocation || 'Not provided',
        req.body.hospitalName || 'Not provided',
        req.body.hospitalAddress || 'Not provided',
        req.body.pincode || 'Not provided',
        new Date().toISOString()
    );

    res.send({
        message: 'Emergency profile loaded successfully.',
        user: {
            name: patientResult.user.name,
            healthId: patientResult.user.health_id
        },
        profile: patientResult.profile
    });
});

app.get('/api/access-log', checkAuth, (req, res) => {
    const db = getDb();

    const user = db.prepare(
        'SELECT health_id FROM users WHERE id = ?'
    ).get(req.userId);

    const logs = db.prepare(`
        SELECT id, health_id, accessed_by, access_location, accessed_at
        FROM access_logs
        WHERE health_id = ?
        ORDER BY accessed_at DESC
    `).all(user.health_id);

    res.send(logs);
});

// Document upload by patient
app.post('/api/documents', checkAuth, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded.' });
    }
    const db = getDb();
    db.prepare('INSERT INTO documents (user_id, original_name, stored_name, mime_type, size) VALUES (?, ?, ?, ?, ?)')
        .run(req.userId, req.file.originalname, req.file.filename, req.file.mimetype, req.file.size);
    res.send({ message: 'File uploaded.' });
});

// Patient list own documents
app.get('/api/documents', checkAuth, (req, res) => {
    const db = getDb();
    const docs = db.prepare('SELECT id, original_name, uploaded_at, size FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC').all(req.userId);
    res.send(docs);
});

// Delete a document (patient only, own file)
app.delete('/api/documents/:id', checkAuth, (req, res) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).send({ message: 'Invalid file id' });
    const db = getDb();
    const doc = db.prepare('SELECT * FROM documents WHERE id = ? AND user_id = ?').get(id, req.userId);
    if (!doc) return res.status(404).send({ message: 'File not found' });
    const filepath = path.join(UPLOAD_DIR, doc.stored_name);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    db.prepare('DELETE FROM documents WHERE id = ?').run(id);
    res.send({ message: 'File deleted.' });
});

// Doctor fetch docs by Health ID
app.get('/api/doctor/documents/:healthId', checkDoctorAuth, (req, res) => {
    const db = getDb();
    const user = db.prepare('SELECT id FROM users WHERE health_id = ?').get(req.params.healthId.toUpperCase());
    if (!user) return res.status(404).send({ message: 'No patient found for that Health ID.' });
    const docs = db.prepare('SELECT id, original_name, uploaded_at, size FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC').all(user.id);
    res.send(docs);
});

// Download file (either patient or doctor must already know the id)
app.get('/api/documents/file/:id', (req, res) => {
    const db = getDb();
    const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(Number(req.params.id));
    if (!doc) return res.status(404).send({ message: 'File not found' });
    const filepath = path.join(UPLOAD_DIR, doc.stored_name);
    if (!fs.existsSync(filepath)) return res.status(404).send({ message: 'File missing on server' });
    res.download(filepath, doc.original_name);
});

// Inline preview (Content-Disposition inline)
app.get('/api/documents/preview/:id', (req, res) => {
    const db = getDb();
    const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(Number(req.params.id));
    if (!doc) return res.status(404).send({ message: 'File not found' });
    const filepath = path.join(UPLOAD_DIR, doc.stored_name);
    if (!fs.existsSync(filepath)) return res.status(404).send({ message: 'File missing on server' });
    res.setHeader('Content-Disposition', `inline; filename="${doc.original_name}"`);
    res.sendFile(filepath);
});

app.listen(PORT, () => {
    console.log(`Life Link backend is running on http://localhost:${PORT}`);
});
