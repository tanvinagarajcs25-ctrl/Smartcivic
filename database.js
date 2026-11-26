const Database = require('better-sqlite3');

// Connect to the database
const db = new Database('complaints.db');

// Create complaints table
db.exec(`
    CREATE TABLE IF NOT EXISTS complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        image_url TEXT,
        status TEXT NOT NULL DEFAULT 'Submitted',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`);

console.log('Complaints database and table created successfully!');

module.exports = db;