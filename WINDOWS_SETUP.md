# Legal Navigator - Windows Local Development Setup

## Quick Start for Windows

### Prerequisites
1. Download and install [Node.js 18+](https://nodejs.org/)
2. Download and install [MySQL 8.0+](https://dev.mysql.com/downloads/mysql/)
3. Download and install [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)

### Setup Steps

1. **Extract Project Files**
   ```cmd
   cd C:\Users\USER\Desktop\LegalNavigator
   ```

2. **Install Dependencies**
   ```cmd
   npm install cross-env
   npm install
   ```

3. **Setup Database**
   - Open MySQL Workbench
   - Connect to your local MySQL server (usually `localhost:3306`)
   - Open the `database-setup.sql` file from this project
   - Execute the entire script (Ctrl+Shift+Enter)

4. **Configure Environment**
   ```cmd
   copy .env.example .env
   ```
   
   Edit `.env` with your MySQL credentials:
   ```
   DATABASE_URL=mysql://root:your_mysql_password@localhost:3306/lawhelp_db
   SESSION_SECRET=your-secret-key-here
   JWT_SECRET=your-jwt-secret-here
   ```

5. **Start Application**
   ```cmd
   npm run dev
   ```

### Troubleshooting Windows Issues

**If you get "NODE_ENV is not recognized":**
- Make sure cross-env is installed: `npm install cross-env`
- Use the provided `package-local.json` instead of `package.json`

**For PowerShell redirection issues:**
```powershell
# Instead of: mysql -u root -p lawhelp_db < database-setup.sql
# Use MySQL Workbench or:
Get-Content database-setup.sql | mysql -u root -p lawhelp_db
```

**Database Connection Issues:**
1. Verify MySQL service is running (Services.msc → MySQL80)
2. Test connection in MySQL Workbench first
3. Check firewall settings for port 3306

### Test Accounts
- Admin: `admin@lawhelp.com` / `password`
- Lawyer: `lawyer@lawhelp.com` / `password`
- User: `user@lawhelp.com` / `password`

### Application URLs
- Main App: http://localhost:5000
- API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health