import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

// Database configuration with fallback handling
let db: any;
let connectionEstablished = false;

async function createDatabaseConnection() {
  try {
    // Create connection pool for better performance
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'lawhelp_db',
      port: parseInt(process.env.DB_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000,
    });

    // Test the connection
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    
    db = drizzle(pool, { schema, mode: 'default' });
    connectionEstablished = true;
    console.log('✅ MySQL database connected successfully');
    
    return db;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
    console.log('📋 Please ensure MySQL is running and database is created');
    console.log('📋 Run the SQL script from database-setup.sql in MySQL Workbench');
    console.log('📋 Check your .env file for correct database credentials');
    
    // For development, we'll throw the error to prevent the app from starting with broken DB
    throw new Error('Database connection failed. Please check MySQL setup.');
  }
}

// Initialize database connection
export const initializeDatabase = async () => {
  if (!connectionEstablished) {
    await createDatabaseConnection();
  }
  return db;
};

// Export database instance
export { db };