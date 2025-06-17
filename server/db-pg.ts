import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from "../shared/schema-pg";

// Database configuration with PostgreSQL
async function createDatabaseConnection() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql, { schema, mode: 'default' });
    
    console.log('✅ PostgreSQL database connected successfully');
    return db;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    throw new Error('Database connection failed. Please check PostgreSQL setup.');
  }
}

export const db = await createDatabaseConnection();