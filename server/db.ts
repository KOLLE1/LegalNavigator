
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../shared/schema.js';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

async function createDatabaseConnection() {
  try {
    const DATABASE_URL = process.env.DATABASE_URL;
    
    // Parse the DATABASE_URL to get connection parameters
    const url = new URL(DATABASE_URL);
    
    const connection = await mysql.createConnection({
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading slash
      multipleStatements: true,
    });

    console.log('✅ MySQL database connected successfully');
    
    const db = drizzle(connection, { schema, mode: 'default' });
    return db;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
    console.log('📋 Please ensure MySQL is running and database is created');
    console.log('📋 Run the SQL script from database-setup.sql in MySQL Workbench');
    console.log('📋 Check your .env file for correct database credentials');
    
    throw new Error('Database connection failed. Please check MySQL setup.');
  }
}

export const db = await createDatabaseConnection();
