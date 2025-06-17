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
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **AI Integration**: OpenAI API for legal assistance
- **Real-time Communication**: WebSocket support for live chat

### Database Schema
The application uses PostgreSQL with the following key entities:
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
- Two-factor authentication support (Email/SMS)
- Email verification for account security

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
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **express**: Web application framework
- **jsonwebtoken**: JWT authentication
- **bcrypt**: Password hashing
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
- **Database**: PostgreSQL 16 with Drizzle migrations
- **Hot Reload**: Vite development server with HMR
- **Port Configuration**: Frontend on port 5000, WebSocket on same port

### Production Build
- **Frontend**: Vite build process generating optimized static assets
- **Backend**: esbuild bundling with ESM format
- **Database**: Drizzle migrations for schema management
- **Deployment**: Autoscale deployment target on Replit

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API authentication
- `JWT_SECRET`: JWT token signing secret

## Changelog

```
Changelog:
- June 17, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```