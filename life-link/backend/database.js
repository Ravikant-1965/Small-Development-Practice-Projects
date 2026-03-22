// database.js
// This file opens our SQLite database and makes sure all tables exist.
// I am also doing a tiny "migration" step so older versions of the
// database still work if the table structure changed while building.

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'lifelink.db');

let db;

// Small helper:
// SQLite makes it easy to check a table's columns using PRAGMA table_info.
// If a column is missing, we add it with ALTER TABLE.
function addColumnIfMissing(tableName, columnName, columnDefinition) {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    const columnExists = columns.some((column) => column.name === columnName);

    if (!columnExists) {
        db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
    }
}

function initDatabase() {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');

    console.log('Connected to SQLite database at:', DB_PATH);

    // Table 1: users
    // Stores account info and the generated Life Link Health ID.
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            health_id TEXT NOT NULL UNIQUE,
            created_at TEXT DEFAULT (datetime('now'))
        )
    `);

    // Table 2: profiles
    // Stores the medical details that emergency responders need.
    db.exec(`
        CREATE TABLE IF NOT EXISTS profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            full_name TEXT,
            date_of_birth TEXT,
            blood_group TEXT,
            allergies TEXT,
            previous_prescriptions TEXT,
            chronic_conditions TEXT,
            current_medications TEXT,
            previous_surgeries TEXT,
            emergency_contact_name TEXT,
            emergency_contact_phone TEXT,
            organ_donor_status TEXT DEFAULT 'Not specified',
            updated_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Table 3: access_logs
    // Every emergency lookup gets recorded here so the patient can review it later.
    db.exec(`
        CREATE TABLE IF NOT EXISTS access_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            health_id TEXT NOT NULL,
            accessed_by TEXT,
            access_location TEXT,
            accessed_at TEXT NOT NULL
        )
    `);

    // Table 4: doctors (simple auth for emergency access)
    db.exec(`
        CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_plain TEXT NOT NULL
        )
    `);

    // These ALTER TABLE checks help if the database file already existed
    // from an earlier version of the project.
    addColumnIfMissing('profiles', 'previous_prescriptions', 'TEXT');
    addColumnIfMissing('profiles', 'updated_at', "TEXT DEFAULT (datetime('now'))");
    addColumnIfMissing('access_logs', 'accessed_by', "TEXT DEFAULT 'Anonymous emergency visitor'");
    addColumnIfMissing('access_logs', 'access_location', 'TEXT');
    addColumnIfMissing('access_logs', 'hospital_name', 'TEXT');
    addColumnIfMissing('access_logs', 'hospital_address', 'TEXT');
    addColumnIfMissing('access_logs', 'pincode', 'TEXT');
    addColumnIfMissing('profiles', 'age', 'TEXT');
    addColumnIfMissing('profiles', 'weight', 'TEXT');
    addColumnIfMissing('profiles', 'gender', 'TEXT');
    addColumnIfMissing('profiles', 'chief_complaint', 'TEXT');
    addColumnIfMissing('profiles', 'medical_history', 'TEXT');
    addColumnIfMissing('profiles', 'lab_results', 'TEXT');
    addColumnIfMissing('profiles', 'kidney_function', 'TEXT');
    addColumnIfMissing('profiles', 'liver_function', 'TEXT');
    addColumnIfMissing('profiles', 'pregnancy_status', 'TEXT');
    addColumnIfMissing('profiles', 'family_history', 'TEXT');
    addColumnIfMissing('profiles', 'substance_use', 'TEXT');
    addColumnIfMissing('profiles', 'mental_health', 'TEXT');
    addColumnIfMissing('profiles', 'previous_treatments', 'TEXT');
    addColumnIfMissing('profiles', 'interaction_warnings', 'TEXT');

    // documents table for uploads
    db.exec(`
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            original_name TEXT NOT NULL,
            stored_name TEXT NOT NULL,
            mime_type TEXT,
            size INTEGER,
            uploaded_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    console.log('Database tables are ready.');

    // Seed a simple doctor account if none exists (so testing is easy)
    const doctorCount = db.prepare('SELECT COUNT(1) as c FROM doctors').get().c;
    if (doctorCount === 0) {
        db.prepare(`
            INSERT INTO doctors (name, email, password_plain)
            VALUES ('Dr. Demo', 'doctor@lifelink.com', 'doctor123')
        `).run();
        console.log('Seeded default doctor account: doctor@lifelink.com / doctor123');
    }
}

function getDb() {
    if (!db) {
        throw new Error('Database is not ready yet. Call initDatabase() first.');
    }

    return db;
}

module.exports = {
    initDatabase,
    getDb
};
