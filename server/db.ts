import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../shared/schema-pg.js';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please provision a PostgreSQL database in Replit.",
  );
}

async function createDatabaseConnection() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql, { schema });

    console.log('✅ PostgreSQL database connected successfully');
    return db;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    console.log('📋 Please provision a PostgreSQL database in Replit');
    console.log('📋 Go to Database tab and create a PostgreSQL database');

    throw new Error('Database connection failed. Please check PostgreSQL setup.');
  }
}

export const db = await createDatabaseConnection();