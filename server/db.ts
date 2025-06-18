import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../shared/schema.js';

// Check if running in Replit environment
const isReplit = process.env.REPLIT_DEPLOYMENT_ID || process.env.REPL_ID;

async function createDatabaseConnection() {
  try {
    if (isReplit) {
      // Replit environment - still use PostgreSQL for production
      const { drizzle: pgDrizzle } = await import('drizzle-orm/neon-http');
      const { neon } = await import('@neondatabase/serverless');
      const pgSchema = await import('../shared/schema-pg.js');
      
      if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL must be set. Please provision a PostgreSQL database in Replit.");
      }
      const sql = neon(process.env.DATABASE_URL);
      const db = pgDrizzle(sql, { schema: pgSchema });
      console.log('✅ PostgreSQL database connected successfully (Replit)');
      return db;
    } else {
      // Local development - use MySQL
      console.log('🔧 Local development detected - connecting to MySQL');
      
      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'lawhelp_db',
        multipleStatements: true,
      };

      if (!process.env.DB_PASSWORD) {
        console.log('📋 For MySQL Workbench connection, create a .env file with:');
        console.log('DB_HOST=localhost');
        console.log('DB_USER=root');
        console.log('DB_PASSWORD=your_mysql_password');
        console.log('DB_NAME=lawhelp_db');
        console.log('DB_PORT=3306');
        console.log('');
        console.log('Make sure to create the database in MySQL Workbench:');
        console.log('CREATE DATABASE lawhelp_db;');
      }

      const connection = await mysql.createConnection(dbConfig);
      const db = drizzle(connection, { schema, mode: 'default' });
      console.log('✅ MySQL database connected successfully (Local)');
      return db;
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    if (!isReplit) {
      console.log('🔧 Falling back to in-memory storage for local development');
      const { initializeStorage } = await import('./storage-fallback.js');
      const storage = await initializeStorage();
      return {
        storage,
        query: () => { throw new Error('Direct DB queries not available in fallback mode'); }
      };
    }
    
    throw error;
  }
}

// Initialize database connection
export const db = createDatabaseConnection();