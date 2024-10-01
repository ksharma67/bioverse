import fs from 'fs';
import path from 'path';
import pg from 'pg';
import connectionString from 'pg-connection-string';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env.local' });  // Load environment variables

// Use POSTGRES_URL as the primary database connection string
let connectionUrl = process.env.POSTGRES_URL;

// Fallback to DATABASE_URL if POSTGRES_URL is not defined
if (!connectionUrl) {
  console.warn("POSTGRES_URL is not defined. Falling back to DATABASE_URL.");
  connectionUrl = process.env.DATABASE_URL;
}

// Log the connection string being used (remove in production for security)
console.log("Connecting to database:", connectionUrl); 

const { Pool } = pg;
const config = connectionString.parse(connectionUrl);
const pool = new Pool(config);

// Function to run SQL file
const runSqlFile = async (filePath) => {
  try {
    // Read the SQL file
    const sql = fs.readFileSync(filePath, 'utf8');

    // Execute the SQL commands
    const client = await pool.connect();
    try {
      await client.query(sql);
      console.log(`Successfully executed SQL file: ${filePath}`);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error executing SQL file:', err);
  }
};

export { pool };

// Get the directory name from the current module's URL
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const sqlFilePath = path.join(__dirname, 'db.sql'); // Adjust the path as necessary
runSqlFile(sqlFilePath);
