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
        priority TEXT NOT NULL DEFAULT 'Medium',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`);
// Add priority column if it doesn't already exist
const columns = db.prepare('PRAGMA table_info(complaints)').all();

const priorityExists = columns.some(
    (column) => column.name === 'priority'
);

if (!priorityExists) {
    db.exec(`
        ALTER TABLE complaints
        ADD COLUMN priority TEXT NOT NULL DEFAULT 'Medium'
    `);

    console.log('Priority column added successfully!');
}

console.log('Complaints database and table created successfully!');

module.exports = db;