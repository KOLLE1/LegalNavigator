import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../shared/schema-pg.js';

// Check if running in Replit environment
const isReplit = process.env.REPLIT_DEPLOYMENT_ID || process.env.REPL_ID;

async function createDatabaseConnection() {
  try {
    if (isReplit) {
      // Replit environment - use Neon serverless
      if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL must be set. Please provision a PostgreSQL database in Replit.");
      }
      const sql = neon(process.env.DATABASE_URL);
      const db = drizzle(sql, { schema });
      console.log('✅ PostgreSQL database connected successfully (Replit)');
      return db;
    } else {
      // Local development - use different approach or fallback
      console.log('🔧 Local development detected');
      
      if (!process.env.DATABASE_URL) {
        console.log('📋 For local development, create a .env file with:');
        console.log('DATABASE_URL=postgresql://username:password@localhost:5432/lawhelp_db');
        console.log('');
        console.log('Or install and setup PostgreSQL locally:');
        console.log('1. Install PostgreSQL');
        console.log('2. Create database: CREATE DATABASE lawhelp_db;');
        console.log('3. Set DATABASE_URL in .env file');
        
        // Import and use the fallback storage for local development
        const { initializeStorage } = await import('./storage-fallback.js');
        const storage = await initializeStorage();
        console.log('🔧 Using in-memory storage for local development');
        
        // Return a minimal db-compatible object for local development
        return {
          storage,
          query: () => { throw new Error('Direct DB queries not available in fallback mode'); }
        };
      }
      
      // If DATABASE_URL is provided locally, try to use it with Neon
      const sql = neon(process.env.DATABASE_URL);
      const db = drizzle(sql, { schema });
      console.log('✅ PostgreSQL database connected successfully (Local)');
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

export const db = await createDatabaseConnection();