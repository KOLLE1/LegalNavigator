# Local Development Setup

This guide helps you run the LawHelp application on your local machine.

## Prerequisites

1. **Node.js 20+** - Install from [nodejs.org](https://nodejs.org/)
2. **PostgreSQL** - Install from [postgresql.org](https://www.postgresql.org/download/)

## Database Setup

### Option 1: PostgreSQL (Recommended)
1. Install PostgreSQL locally
2. Create a database:
   ```sql
   CREATE DATABASE lawhelp_db;
   ```
3. Create a `.env` file in the project root:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/lawhelp_db
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   NODE_ENV=development
   PORT=5000
   ```

### Option 2: In-Memory Storage (Testing Only)
If you don't want to set up PostgreSQL, the application will automatically use in-memory storage when no database is configured. This is suitable for testing but data won't persist between restarts.

## Installation & Running

1. Clone/download the project
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:5000 in your browser

## Default Login Credentials

- **Admin:** admin@lawhelp.cm / admin123
- **User:** user@lawhelp.cm / user123  
- **Lawyer 1:** lawyer@lawhelp.cm / lawyer123
- **Lawyer 2:** lawyer2@lawhelp.cm / lawyer123

## Environment Variables

Copy `.env.example` to `.env` and update the values:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `NODE_ENV` - Set to 'development'
- `PORT` - Server port (default: 5000)

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `CREATE DATABASE lawhelp_db;`

### Missing Dependencies
```bash
npm install
```

### Port Already in Use
Change the PORT in your `.env` file or stop other applications using port 5000.

## Production Deployment

For production deployment, use Replit which provides:
- Automatic PostgreSQL database provisioning
- Environment variable management
- SSL certificates and domain hosting
- Continuous deployment from Git

The application is optimized for Replit deployment with automatic fallbacks for local development.