// Simple database connection for the migration
console.log('🔧 Local development detected - using in-memory storage');
console.log('📋 To connect to MySQL Workbench later, update your .env file with:');
console.log('DB_HOST=localhost');
console.log('DB_USER=root');
console.log('DB_PASSWORD=your_mysql_password');
console.log('DB_NAME=lawhelp_db');
console.log('DB_PORT=3306');

// For now, export a placeholder that won't cause startup issues
export const db = Promise.resolve({
  query: () => { throw new Error('Database not configured - using in-memory storage'); }
});