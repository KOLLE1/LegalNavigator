# LawHelp - Cameroon Legal Assistant

## Overview

LawHelp is a full-stack web application that provides AI-powered legal assistance specifically for Cameroon law. The application combines artificial intelligence with human legal expertise to offer accessible legal guidance to users. It features an AI legal assistant, lawyer directory, chat functionality, and comprehensive legal knowledge base.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite for development and bundling
- **UI Components**: Comprehensive component library using Radix UI primitives

### Backend Architecture
- **Runtime**: Node.js 20 with Express.js
- **Language**: TypeScript with ES modules
- **Database**: MySQL 8.0+ with Drizzle ORM
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **2FA Options**: Email (via FormSubmit) and TOTP (authenticator apps)
- **AI Integration**: OpenAI API for legal assistance
- **Real-time Communication**: WebSocket support for live chat

### Database Schema
The application uses MySQL with the following key entities:
- **Users**: User accounts with authentication and profile information
- **Chat Sessions**: Conversation containers for organizing legal consultations
- **Chat Messages**: Individual messages in conversations (user and AI)
- **Lawyers**: Professional legal practitioners with credentials and specializations
- **Lawyer Ratings**: Review system for legal professionals
- **Verification Codes**: Two-factor authentication and email verification
- **Notifications**: User notification system

## Key Components

### AI Legal Service
- Specialized AI assistant trained on Cameroon legal domains
- Covers Criminal Law, Family Law, Property Law, Business Law, Employment Law, and Constitutional Law
- Provides contextual legal information with appropriate disclaimers
- Supports both English and French (reflecting Cameroon's dual legal system)

### Authentication System
- JWT-based authentication with secure token management
- Password hashing using bcrypt
- Enhanced two-factor authentication with dual options:
  - Email-based 2FA using FormSubmit (free service)
  - TOTP-based 2FA supporting Google Authenticator, Authy, 1Password
- Email verification for account security
- Backup codes for TOTP recovery

### Chat System
- Real-time messaging using WebSockets
- Session-based conversation management
- AI response generation with metadata tracking
- Message history and session archiving

### Lawyer Directory
- Verified legal professional profiles
- Specialization and practice area filtering
- Rating and review system
- Location-based search functionality

### User Interface
- Responsive design with mobile-first approach
- Dark/light theme support
- Modern component library with consistent styling
- Accessible design following WCAG guidelines

## Data Flow

1. **User Authentication**: Users register/login through JWT-based auth system
2. **Chat Initialization**: Users start new chat sessions or continue existing ones
3. **AI Processing**: Legal queries are processed through specialized AI service
4. **Response Generation**: AI provides contextual legal guidance with appropriate disclaimers
5. **Lawyer Matching**: Users can find and connect with verified legal professionals
6. **Real-time Updates**: WebSocket connections enable live chat functionality

## External Dependencies

### Core Dependencies
- **mysql2**: MySQL database connection
- **drizzle-orm**: Type-safe database ORM with MySQL support
- **express**: Web application framework
- **jsonwebtoken**: JWT authentication
- **bcrypt**: Password hashing
- **speakeasy**: TOTP generation and verification
- **qrcode**: QR code generation for TOTP setup
- **node-fetch**: HTTP requests for FormSubmit integration
- **ws**: WebSocket implementation

### Frontend Dependencies
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **wouter**: Lightweight routing library
- **tailwindcss**: Utility-first CSS framework
- **date-fns**: Date manipulation utilities

### AI Integration
- **OpenAI API**: Powers the legal assistant functionality
- Custom prompt engineering for Cameroon legal context

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: MySQL 8.0+ with connection pooling
- **External Database**: Supports local MySQL Workbench setup
- **Hot Reload**: Vite development server with HMR
- **Port Configuration**: Frontend on port 5000, WebSocket on same port

### Production Build
- **Frontend**: Vite build process generating optimized static assets
- **Backend**: esbuild bundling with ESM format
- **Database**: Drizzle migrations for schema management
- **Deployment**: Autoscale deployment target on Replit

### Environment Variables
- `DB_HOST`: MySQL server host (default: localhost)
- `DB_USER`: MySQL username (default: root)
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: MySQL database name (default: lawhelp_db)
- `DB_PORT`: MySQL port (default: 3306)
- `OPENAI_API_KEY`: OpenAI API authentication
- `JWT_SECRET`: JWT token signing secret

## Changelog

```
Changelog:
- June 17, 2025: Initial setup with PostgreSQL
- June 17, 2025: Migrated to MySQL database with enhanced 2FA
- June 18, 2025: Successfully migrated from Replit Agent to standard Replit environment
  - Fixed package dependencies and installed missing tsx and cross-env
  - Configured PostgreSQL database with proper schema for Replit environment
  - Created default user accounts for testing
  - Added environment detection for local vs Replit development
  - Implemented fallback storage for local development
  - Verified application functionality in Replit environment
  - Configured MySQL Workbench integration for local development
  - Updated schema to support both PostgreSQL (Replit) and MySQL (local)
  - Application successfully running on port 5000
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```