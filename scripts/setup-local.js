#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Setting up Legal Navigator for local Windows development...\n');

// Check if package-local.json exists and copy it
if (fs.existsSync('package-local.json')) {
  console.log('✓ Copying local package.json configuration...');
  fs.copyFileSync('package-local.json', 'package.json');
} else {
  console.log('⚠ package-local.json not found, using existing package.json');
}

// Check if drizzle-local.config.ts exists and copy it
if (fs.existsSync('drizzle-local.config.ts')) {
  console.log('✓ Copying local Drizzle configuration...');
  fs.copyFileSync('drizzle-local.config.ts', 'drizzle.config.ts');
} else {
  console.log('⚠ drizzle-local.config.ts not found, using existing drizzle.config.ts');
}

// Check if .env exists
if (!fs.existsSync('.env')) {
  if (fs.existsSync('.env.example')) {
    console.log('✓ Creating .env from .env.example...');
    fs.copyFileSync('.env.example', '.env');
    console.log('⚠ Please edit .env with your MySQL credentials');
  } else {
    console.log('⚠ .env.example not found, creating basic .env...');
    const envContent = `# Database Configuration
DATABASE_URL=mysql://root:password@localhost:3306/lawhelp_db

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Application Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-change-this
`;
    fs.writeFileSync('.env', envContent);
  }
}

console.log('\n📋 Next Steps:');
console.log('1. Install MySQL and MySQL Workbench');
console.log('2. Run the database-setup.sql script in MySQL Workbench');
console.log('3. Update .env with your MySQL credentials');
console.log('4. Run: npm install');
console.log('5. Run: npm run dev');
console.log('\nFor detailed instructions, see WINDOWS_SETUP.md');