# Legal Navigator - Local Windows Setup Guide

A comprehensive legal assistance platform with AI-powered advice and lawyer directory for Cameroon law.

## Prerequisites

1. **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
2. **MySQL 8.0+** - Download from [mysql.com](https://dev.mysql.com/downloads/mysql/)
3. **MySQL Workbench** - Download from [mysql.com](https://dev.mysql.com/downloads/workbench/)
4. **Git** - Download from [git-scm.com](https://git-scm.com/)

## Local Installation

### 1. Clone and Setup Project

```bash
git clone <your-repository-url>
cd LegalNavigator
npm install
```

### 2. Database Setup

#### Option A: Using MySQL Workbench (Recommended)
1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Open the `database-setup.sql` file in this project
4. Execute the entire script (this creates the database and tables)

#### Option B: Command Line
```bash
# Connect to MySQL
mysql -u root -p

# Run the setup script
source database-setup.sql
```

### 3. Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

2. Edit `.env` file with your settings:
```env
DATABASE_URL=mysql://root:yourpassword@localhost:3306/lawhelp_db
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
JWT_SECRET=your-jwt-secret-key-change-this
PORT=5000
NODE_ENV=development
```

### 4. Database Schema Migration

```bash
npm run db:push
```

### 5. Start the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Application Features

### User Features
- User registration and authentication
- AI-powered legal advice chat
- Lawyer directory search and filtering
- Two-factor authentication (TOTP and email)
- Multi-language support (English/French)

### Lawyer Features
- Lawyer profile creation and management
- Specialization and certification tracking
- Rating and review system
- Availability scheduling

### Admin Features
- User and lawyer management
- System metrics and monitoring
- Content moderation

## Testing Accounts

The database setup includes these test accounts:

```
Admin: admin@lawhelp.com / password
Lawyer: lawyer@lawhelp.com / password  
User: user@lawhelp.com / password
```

## Database Schema

The application uses MySQL with these main tables:
- `users` - User accounts and authentication
- `lawyers` - Lawyer profiles and information
- `chat_sessions` - AI chat conversations
- `chat_messages` - Individual chat messages
- `lawyer_ratings` - Lawyer reviews and ratings
- `verification_codes` - Email/2FA verification
- `notifications` - User notifications

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-email` - Email verification

### Chat System
- `GET /api/chat/sessions` - Get user chat sessions
- `POST /api/chat/sessions` - Create new chat session
- `GET /api/chat/sessions/:id/messages` - Get chat messages
- `POST /api/chat/sessions/:id/messages` - Send chat message

### Lawyers
- `GET /api/lawyers` - Get lawyer directory
- `GET /api/lawyers/:id` - Get lawyer details
- `POST /api/lawyers/:id/rate` - Rate a lawyer

## Troubleshooting

### Common Issues

1. **MySQL Connection Error**
   - Verify MySQL service is running
   - Check username/password in `.env`
   - Ensure database `lawhelp_db` exists

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill process using port 5000: `netstat -ano | findstr :5000`

3. **npm install fails**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and package-lock.json, then reinstall

### Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run check

# Database migrations
npm run db:push
```

## Project Structure

```
LegalNavigator/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   └── lib/            # Utility functions
├── server/                 # Backend Express application
│   ├── routes.ts           # API route definitions
│   ├── storage-mysql.ts    # MySQL database operations
│   ├── ai-service.ts       # AI legal advice service
│   └── 2fa-service.ts      # Two-factor authentication
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema definitions
├── database-setup.sql      # MySQL database setup script
└── .env.example           # Environment variables template
```

## AI Integration

The application includes a flexible AI service that can be integrated with:
- OpenAI GPT models
- Hugging Face models
- Local AI models
- Custom API endpoints

Check `server/example-model-integration.ts` for implementation examples.

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Session management
- Two-factor authentication
- SQL injection prevention
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details