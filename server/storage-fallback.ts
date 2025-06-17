// Storage fallback system - automatically chooses MySQL or in-memory storage
import { IStorage } from './storage.js';

let storageInstance: IStorage | null = null;

async function initializeStorage(): Promise<IStorage> {
  if (storageInstance) {
    return storageInstance;
  }

  // Try MySQL first if DATABASE_URL is configured
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('mysql')) {
    try {
      console.log('Attempting to connect to MySQL database...');
      const { storage: mysqlStorage } = await import('./storage-mysql.js');
      // Test the connection by attempting a simple operation
      await mysqlStorage.getUser('test-connection');
      console.log('MySQL database connected successfully');
      storageInstance = mysqlStorage;
      return storageInstance;
    } catch (error) {
      console.warn('MySQL connection failed, falling back to in-memory storage:', error.message);
    }
  }

  // Fallback to in-memory storage
  console.log('Using in-memory storage');
  const { storage: memStorage } = await import('./storage.js');
  storageInstance = memStorage;
  return storageInstance;
}

export { initializeStorage };