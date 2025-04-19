import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

// Database file path
const dbPath = path.resolve(__dirname, '../../dev.db');
const schemaPath = path.resolve(__dirname, './schema.sql');

// Create a new database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    return;
  }
  console.log('Connected to SQLite database');
  
  // Initialize schema if the database is new
  if (!fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0) {
    initializeSchema();
  }
});

// Function to initialize schema
function initializeSchema() {
  console.log('Initializing database schema...');
  
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const statements = schema.split(';').filter(stmt => stmt.trim());
  
  db.serialize(() => {
    // Begin transaction
    db.run('BEGIN TRANSACTION');
    
    // Execute each statement
    statements.forEach(statement => {
      db.run(statement + ';', err => {
        if (err) {
          console.error('Error executing schema statement:', err.message);
          console.error('Statement:', statement);
        }
      });
    });
    
    // Commit transaction
    db.run('COMMIT', err => {
      if (err) {
        console.error('Error committing schema transaction:', err.message);
      } else {
        console.log('Database schema initialized successfully');
      }
    });
  });
}

// Export the database instance
export default db;