# MySQL Workbench Setup Guide

## Step 1: Install and Setup MySQL

1. **Install MySQL Server** (if not already installed)
   - Download from https://dev.mysql.com/downloads/mysql/
   - During installation, set a root password (remember this!)

2. **Install MySQL Workbench** (if not already installed)
   - Download from https://dev.mysql.com/downloads/workbench/

## Step 2: Create Database in MySQL Workbench

1. **Open MySQL Workbench**
2. **Connect to your local MySQL server**
   - Click on your local connection (usually `Local instance 3306`)
   - Enter your root password

3. **Run the setup script**
   - Open the file `setup-mysql.sql` in MySQL Workbench
   - Execute the entire script (Ctrl+Shift+Enter)
   - This will create the `lawhelp_db` database and all required tables

## Step 3: Configure Your Application

1. **Update your .env file** with your actual MySQL credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_actual_mysql_password
   DB_NAME=lawhelp_db
   DB_PORT=3306
   ```

2. **Replace `your_actual_mysql_password`** with the password you set during MySQL installation

## Step 4: Test the Connection

1. **Restart your application** (the workflow will restart automatically)
2. **Check the console logs** - you should see:
   ```
   ✅ MySQL database connected successfully
   ```

## Step 5: Verify Database Tables

In MySQL Workbench, you can verify the tables were created:

```sql
USE lawhelp_db;
SHOW TABLES;
```

You should see these tables:
- users
- chat_sessions
- chat_messages
- lawyers
- lawyer_ratings
- verification_codes
- notifications
- sessions

## Troubleshooting

**Connection Failed?**
- Make sure MySQL service is running
- Verify your password in the .env file
- Check that port 3306 is not blocked
- Ensure the database `lawhelp_db` exists

**Tables Missing?**
- Re-run the `setup-mysql.sql` script in MySQL Workbench
- Check for any error messages in the script execution

## Database Migration Commands

If you need to update the database schema later:

```bash
# Generate migration files
npm run db:generate

# Push changes to database
npm run db:push

# View your database in Drizzle Studio
npm run db:studio
```

## Sample Data

The setup script includes sample users:
- **User**: john@example.com (password: demo123)
- **Lawyer**: jane@lawfirm.com (password: demo123)

You can use these for testing once you implement proper authentication.