@echo off
echo Setting up Legal Navigator for Windows...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Install cross-env first
echo Installing cross-env for Windows compatibility...
npm install cross-env

REM Install all dependencies
echo Installing project dependencies...
npm install

REM Copy local configuration files
if exist package-local.json (
    echo Copying local package.json...
    copy package-local.json package.json
)

if exist drizzle-local.config.ts (
    echo Copying local Drizzle config...
    copy drizzle-local.config.ts drizzle.config.ts
)

REM Create .env if it doesn't exist
if not exist .env (
    if exist .env.example (
        echo Creating .env from template...
        copy .env.example .env
    ) else (
        echo Creating basic .env file...
        echo DATABASE_URL=mysql://root:password@localhost:3306/lawhelp_db > .env
        echo SESSION_SECRET=your-super-secret-session-key >> .env
        echo JWT_SECRET=your-jwt-secret-key >> .env
        echo PORT=5000 >> .env
        echo NODE_ENV=development >> .env
    )
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Install MySQL Server and MySQL Workbench
echo 2. Run database-setup.sql in MySQL Workbench
echo 3. Update .env with your MySQL credentials
echo 4. Run: npm run dev
echo.
echo For detailed instructions, see WINDOWS_SETUP.md
echo.
pause