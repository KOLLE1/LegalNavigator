# MySQL Database Setup for LawHelp

## Prerequisites
1. Install MySQL 8.0 or higher on your machine
2. Install MySQL Workbench for database management

## Step 1: Create Database
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Run the SQL script from `database-setup.sql` file to create the database and tables

Alternatively, you can run these commands in MySQL command line:
```bash
mysql -u root -p < database-setup.sql
```

## Step 2: Configure Environment Variables
1. Copy `.env.example` to `.env`
2. Update the database configuration:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=lawhelp_db
DB_PORT=3306
JWT_SECRET=your-secure-jwt-secret-key
OPENAI_API_KEY=your-openai-api-key
```

## Step 3: Verify Connection
Run the application and check the console for successful database connection.

## Features Included
- **MySQL Database**: Full schema with proper relationships and indexes
- **Email 2FA**: Uses FormSubmit for sending verification codes
- **TOTP 2FA**: Supports Google Authenticator, Authy, and other TOTP apps
- **Enhanced Security**: Password verification for disabling 2FA
- **Backup Codes**: Generated for TOTP setup as recovery options

## FormSubmit Integration
The application uses FormSubmit (https://formsubmit.co) for sending emails:
- No API key required
- Free service
- Automatic email delivery
- Professional email templates

## 2FA Methods
1. **Email**: Sends 6-digit codes via FormSubmit
2. **TOTP**: Works with authenticator apps like:
   - Google Authenticator
   - Authy
   - 1Password
   - Microsoft Authenticator

## Security Features
- JWT tokens with 7-day expiration
- Password hashing with bcrypt
- Rate limiting for verification attempts
- Secure session management
- Email verification required before login