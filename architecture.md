# LawHelp System Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagrams](#architecture-diagrams)
3. [Use Case Diagrams](#use-case-diagrams)
4. [Database Design](#database-design)
5. [Component Architecture](#component-architecture)
6. [Security Architecture](#security-architecture)
7. [Data Flow Diagrams](#data-flow-diagrams)
8. [Deployment Architecture](#deployment-architecture)
9. [API Documentation](#api-documentation)

## System Overview

LawHelp is a comprehensive AI-powered legal assistance platform designed specifically for Cameroon law. The system combines artificial intelligence with human legal expertise to provide accessible legal guidance through a modern web application.

### Key Features
- AI-powered legal assistant specialized in Cameroon law
- Real-time chat interface with WebSocket support
- Lawyer directory with verified professionals
- Enhanced two-factor authentication (Email + TOTP)
- Multi-language support (English/French)
- Responsive web interface

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js 20 + Express.js + TypeScript
- **Database**: MySQL 8.0+ with Drizzle ORM
- **Authentication**: JWT + bcrypt + 2FA (Email/TOTP)
- **Real-time**: WebSocket connections
- **AI**: OpenAI API integration
- **Email**: FormSubmit.co integration

---

## Architecture Diagrams

### 1. High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Tier"
        WEB[Web Browser]
        MOBILE[Mobile Browser]
    end
    
    subgraph "Application Tier"
        LB[Load Balancer]
        APP1[App Server 1]
        APP2[App Server 2]
        WS[WebSocket Server]
    end
    
    subgraph "Service Tier"
        AUTH[Auth Service]
        AI[AI Service]
        EMAIL[Email Service]
        TOTP[TOTP Service]
    end
    
    subgraph "Data Tier"
        DB[(MySQL Database)]
        CACHE[(Redis Cache)]
        FILES[File Storage]
    end
    
    subgraph "External Services"
        OPENAI[OpenAI API]
        FORMSUBMIT[FormSubmit]
    end
    
    WEB --> LB
    MOBILE --> LB
    LB --> APP1
    LB --> APP2
    APP1 --> WS
    APP2 --> WS
    
    APP1 --> AUTH
    APP1 --> AI
    APP1 --> EMAIL
    APP1 --> TOTP
    
    AUTH --> DB
    AI --> OPENAI
    EMAIL --> FORMSUBMIT
    
    APP1 --> DB
    APP1 --> CACHE
    APP1 --> FILES
```

### 2. Component Architecture Diagram

```mermaid
graph LR
    subgraph "Frontend Components"
        AUTH_UI[Authentication UI]
        CHAT_UI[Chat Interface]
        LAWYER_UI[Lawyer Directory]
        PROFILE_UI[Profile Management]
        TFA_UI[2FA Setup]
    end
    
    subgraph "Backend Services"
        API[REST API Layer]
        WS_SERVICE[WebSocket Service]
        AUTH_SERVICE[Authentication Service]
        AI_SERVICE[AI Legal Service]
        TFA_SERVICE[2FA Service]
        STORAGE[Storage Layer]
    end
    
    subgraph "Data Layer"
        USERS[(Users)]
        CHATS[(Chat Sessions)]
        MESSAGES[(Messages)]
        LAWYERS[(Lawyers)]
        CODES[(Verification Codes)]
    end
    
    AUTH_UI --> API
    CHAT_UI --> WS_SERVICE
    LAWYER_UI --> API
    PROFILE_UI --> API
    TFA_UI --> API
    
    API --> AUTH_SERVICE
    API --> AI_SERVICE
    API --> TFA_SERVICE
    API --> STORAGE
    
    WS_SERVICE --> STORAGE
    AUTH_SERVICE --> USERS
    AI_SERVICE --> CHATS
    AI_SERVICE --> MESSAGES
    STORAGE --> LAWYERS
    TFA_SERVICE --> CODES
```

---

## Use Case Diagrams

### 1. User Authentication Use Cases

```mermaid
graph LR
    subgraph "Actors"
        USER[User]
        LAWYER[Lawyer]
        ADMIN[Admin]
    end
    
    subgraph "Authentication Use Cases"
        REGISTER[Register Account]
        LOGIN[Login]
        VERIFY_EMAIL[Verify Email]
        SETUP_2FA[Setup 2FA]
        VERIFY_2FA[Verify 2FA Code]
        RESET_PASSWORD[Reset Password]
        DISABLE_2FA[Disable 2FA]
    end
    
    USER --> REGISTER
    USER --> LOGIN
    USER --> VERIFY_EMAIL
    USER --> SETUP_2FA
    USER --> VERIFY_2FA
    USER --> RESET_PASSWORD
    USER --> DISABLE_2FA
    
    LAWYER --> REGISTER
    LAWYER --> LOGIN
    LAWYER --> VERIFY_EMAIL
    LAWYER --> SETUP_2FA
    
    ADMIN --> LOGIN
    ADMIN --> SETUP_2FA
```

### 2. Legal Assistance Use Cases

```mermaid
graph LR
    subgraph "Actors"
        CLIENT[Client]
        AI[AI Assistant]
        LAWYER[Lawyer]
    end
    
    subgraph "Legal Assistance Use Cases"
        START_CHAT[Start Chat Session]
        ASK_QUESTION[Ask Legal Question]
        GET_AI_RESPONSE[Get AI Response]
        BROWSE_LAWYERS[Browse Lawyers]
        CONTACT_LAWYER[Contact Lawyer]
        RATE_LAWYER[Rate Lawyer]
        VIEW_HISTORY[View Chat History]
        EXPORT_CHAT[Export Chat]
    end
    
    CLIENT --> START_CHAT
    CLIENT --> ASK_QUESTION
    CLIENT --> BROWSE_LAWYERS
    CLIENT --> CONTACT_LAWYER
    CLIENT --> RATE_LAWYER
    CLIENT --> VIEW_HISTORY
    CLIENT --> EXPORT_CHAT
    
    AI --> GET_AI_RESPONSE
    LAWYER --> CONTACT_LAWYER
```

### 3. Lawyer Management Use Cases

```mermaid
graph LR
    subgraph "Actors"
        LAWYER[Lawyer]
        CLIENT[Client]
        ADMIN[Administrator]
    end
    
    subgraph "Lawyer Management Use Cases"
        CREATE_PROFILE[Create Lawyer Profile]
        UPDATE_PROFILE[Update Profile]
        VERIFY_LICENSE[Verify License]
        SET_AVAILABILITY[Set Availability]
        MANAGE_RATINGS[Manage Ratings]
        VIEW_CLIENTS[View Client Messages]
        RESPOND_INQUIRY[Respond to Inquiry]
    end
    
    LAWYER --> CREATE_PROFILE
    LAWYER --> UPDATE_PROFILE
    LAWYER --> SET_AVAILABILITY
    LAWYER --> VIEW_CLIENTS
    LAWYER --> RESPOND_INQUIRY
    
    ADMIN --> VERIFY_LICENSE
    ADMIN --> MANAGE_RATINGS
    
    CLIENT --> MANAGE_RATINGS
```

---

## Database Design

### 1. Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        varchar id PK
        varchar email UK
        varchar name
        text password_hash
        boolean is_lawyer
        boolean two_factor_enabled
        varchar two_factor_method
        text two_factor_secret
        varchar phone
        varchar location
        text profile_image_url
        boolean email_verified
        timestamp created_at
        timestamp updated_at
        timestamp last_active
    }
    
    CHAT_SESSIONS {
        varchar id PK
        varchar user_id FK
        varchar title
        varchar status
        timestamp created_at
        timestamp updated_at
    }
    
    CHAT_MESSAGES {
        varchar id PK
        varchar session_id FK
        varchar user_id FK
        text content
        varchar sender
        json metadata
        timestamp created_at
    }
    
    LAWYERS {
        varchar id PK
        varchar user_id FK
        varchar license_number UK
        varchar specialization
        int experience_years
        json practice_areas
        json languages
        text office_address
        text description
        int hourly_rate
        boolean verified
        int rating
        int total_reviews
        timestamp created_at
        timestamp updated_at
    }
    
    LAWYER_RATINGS {
        varchar id PK
        varchar lawyer_id FK
        varchar user_id FK
        int rating
        text review
        timestamp created_at
    }
    
    VERIFICATION_CODES {
        varchar id PK
        varchar user_id FK
        varchar code
        varchar type
        boolean used
        timestamp expires_at
        timestamp created_at
    }
    
    NOTIFICATIONS {
        varchar id PK
        varchar user_id FK
        varchar title
        text content
        varchar type
        boolean read
        timestamp created_at
    }
    
    USERS ||--o{ CHAT_SESSIONS : creates
    USERS ||--o{ CHAT_MESSAGES : sends
    USERS ||--o| LAWYERS : "can be"
    USERS ||--o{ LAWYER_RATINGS : gives
    USERS ||--o{ VERIFICATION_CODES : receives
    USERS ||--o{ NOTIFICATIONS : receives
    
    CHAT_SESSIONS ||--o{ CHAT_MESSAGES : contains
    LAWYERS ||--o{ LAWYER_RATINGS : receives
```

### 2. Database Schema Details

#### Users Table
- **Primary Key**: UUID for enhanced security
- **Unique Constraints**: Email address
- **Indexes**: Email, created_at, is_lawyer
- **Security**: Password hashed with bcrypt
- **2FA**: Supports both email and TOTP methods

#### Chat System Tables
- **Sessions**: Organize conversations by topic
- **Messages**: Store user and AI responses with metadata
- **Metadata**: AI confidence, references, disclaimers

#### Lawyer System Tables
- **Lawyers**: Professional profiles with verification
- **Ratings**: Client feedback and review system
- **JSON Fields**: Practice areas and languages arrays

#### Security Tables
- **Verification Codes**: Email verification, 2FA, password reset
- **Notifications**: System notifications and alerts

---

## Component Architecture

### 1. Frontend Architecture

```mermaid
graph TD
    subgraph "UI Layer"
        PAGES[Pages]
        COMPONENTS[Components]
        LAYOUTS[Layouts]
    end
    
    subgraph "State Management"
        REACT_QUERY[TanStack Query]
        AUTH_CONTEXT[Auth Context]
        THEME_CONTEXT[Theme Context]
    end
    
    subgraph "Services"
        API_CLIENT[API Client]
        WS_CLIENT[WebSocket Client]
        TOAST_SERVICE[Toast Service]
    end
    
    subgraph "Utilities"
        UTILS[Utils]
        HOOKS[Custom Hooks]
        TYPES[TypeScript Types]
    end
    
    PAGES --> COMPONENTS
    COMPONENTS --> LAYOUTS
    PAGES --> REACT_QUERY
    COMPONENTS --> AUTH_CONTEXT
    COMPONENTS --> THEME_CONTEXT
    
    REACT_QUERY --> API_CLIENT
    COMPONENTS --> WS_CLIENT
    COMPONENTS --> TOAST_SERVICE
    
    COMPONENTS --> HOOKS
    HOOKS --> UTILS
    API_CLIENT --> TYPES
```

### 2. Backend Architecture

```mermaid
graph TD
    subgraph "API Layer"
        ROUTES[Express Routes]
        MIDDLEWARE[Middleware]
        VALIDATION[Request Validation]
    end
    
    subgraph "Business Logic"
        AUTH_SERVICE[Authentication Service]
        AI_SERVICE[AI Legal Service]
        TFA_SERVICE[2FA Service]
        CHAT_SERVICE[Chat Service]
    end
    
    subgraph "Data Access"
        STORAGE[Storage Interface]
        DB_IMPL[Database Implementation]
        SCHEMA[Database Schema]
    end
    
    subgraph "External Integrations"
        OPENAI[OpenAI Client]
        FORMSUBMIT[FormSubmit Client]
        SPEAKEASY[TOTP Service]
    end
    
    ROUTES --> MIDDLEWARE
    MIDDLEWARE --> VALIDATION
    ROUTES --> AUTH_SERVICE
    ROUTES --> AI_SERVICE
    ROUTES --> TFA_SERVICE
    ROUTES --> CHAT_SERVICE
    
    AUTH_SERVICE --> STORAGE
    AI_SERVICE --> OPENAI
    TFA_SERVICE --> FORMSUBMIT
    TFA_SERVICE --> SPEAKEASY
    
    STORAGE --> DB_IMPL
    DB_IMPL --> SCHEMA
```

---

## Security Architecture

### 1. Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database
    participant Email
    participant TOTP
    
    User->>Frontend: Login Request
    Frontend->>API: POST /auth/login
    API->>Database: Verify Credentials
    
    alt 2FA Enabled
        API->>Database: Create Verification Code
        alt Email 2FA
            API->>Email: Send Code via FormSubmit
        else TOTP 2FA
            Note over TOTP: User generates code from app
        end
        API-->>Frontend: Requires 2FA
        User->>Frontend: Enter 2FA Code
        Frontend->>API: POST /auth/verify-2fa
        API->>Database: Verify Code
    end
    
    API->>API: Generate JWT Token
    API-->>Frontend: Return Token + User Data
    Frontend->>Frontend: Store Token
```

### 2. Security Layers

```mermaid
graph TB
    subgraph "Security Layers"
        SSL[SSL/TLS Encryption]
        JWT[JWT Authentication]
        BCRYPT[Password Hashing]
        TFA[Two-Factor Authentication]
        VALIDATION[Input Validation]
        RATE_LIMIT[Rate Limiting]
        CORS[CORS Protection]
    end
    
    subgraph "Data Protection"
        ENCRYPTION[Data Encryption]
        SANITIZATION[Input Sanitization]
        SQL_INJECTION[SQL Injection Prevention]
        XSS[XSS Protection]
    end
    
    SSL --> JWT
    JWT --> BCRYPT
    BCRYPT --> TFA
    TFA --> VALIDATION
    VALIDATION --> RATE_LIMIT
    RATE_LIMIT --> CORS
    
    CORS --> ENCRYPTION
    ENCRYPTION --> SANITIZATION
    SANITIZATION --> SQL_INJECTION
    SQL_INJECTION --> XSS
```

---

## Data Flow Diagrams

### 1. User Registration Flow

```mermaid
graph TD
    START([User Starts Registration])
    FORM[Fill Registration Form]
    VALIDATE[Validate Form Data]
    HASH[Hash Password]
    SAVE[Save User to Database]
    GENERATE[Generate Email Verification Code]
    SEND[Send Verification Email]
    VERIFY[User Verifies Email]
    COMPLETE[Registration Complete]
    
    START --> FORM
    FORM --> VALIDATE
    VALIDATE --> HASH
    HASH --> SAVE
    SAVE --> GENERATE
    GENERATE --> SEND
    SEND --> VERIFY
    VERIFY --> COMPLETE
```

### 2. AI Chat Flow

```mermaid
graph TD
    START([User Asks Question])
    CREATE[Create Chat Session]
    SAVE_Q[Save User Message]
    PROCESS[Process with AI Service]
    CATEGORIZE[Categorize Legal Domain]
    GENERATE[Generate AI Response]
    SAVE_R[Save AI Response]
    BROADCAST[Broadcast via WebSocket]
    DISPLAY[Display to User]
    
    START --> CREATE
    CREATE --> SAVE_Q
    SAVE_Q --> PROCESS
    PROCESS --> CATEGORIZE
    CATEGORIZE --> GENERATE
    GENERATE --> SAVE_R
    SAVE_R --> BROADCAST
    BROADCAST --> DISPLAY
```

### 3. 2FA Setup Flow

```mermaid
graph TD
    START([User Initiates 2FA Setup])
    CHOOSE[Choose 2FA Method]
    
    subgraph "Email 2FA"
        EMAIL_CODE[Generate Email Code]
        SEND_EMAIL[Send via FormSubmit]
    end
    
    subgraph "TOTP 2FA"
        GENERATE_SECRET[Generate TOTP Secret]
        SHOW_QR[Show QR Code]
        BACKUP_CODES[Generate Backup Codes]
    end
    
    VERIFY[User Verifies Code]
    ENABLE[Enable 2FA]
    COMPLETE[Setup Complete]
    
    START --> CHOOSE
    CHOOSE --> EMAIL_CODE
    CHOOSE --> GENERATE_SECRET
    
    EMAIL_CODE --> SEND_EMAIL
    GENERATE_SECRET --> SHOW_QR
    SHOW_QR --> BACKUP_CODES
    
    SEND_EMAIL --> VERIFY
    BACKUP_CODES --> VERIFY
    VERIFY --> ENABLE
    ENABLE --> COMPLETE
```

---

## Deployment Architecture

### 1. Development Environment

```mermaid
graph TB
    subgraph "Development Setup"
        DEV_ENV[Local Development]
        VITE[Vite Dev Server]
        NODE[Node.js Server]
        MYSQL[Local MySQL]
        WORKBENCH[MySQL Workbench]
    end
    
    subgraph "External Services"
        OPENAI_API[OpenAI API]
        FORMSUBMIT_API[FormSubmit API]
    end
    
    DEV_ENV --> VITE
    DEV_ENV --> NODE
    NODE --> MYSQL
    MYSQL --> WORKBENCH
    NODE --> OPENAI_API
    NODE --> FORMSUBMIT_API
```

### 2. Production Environment

```mermaid
graph TB
    subgraph "Production Infrastructure"
        CDN[CDN]
        LB[Load Balancer]
        APP_SERVERS[Application Servers]
        DB_CLUSTER[MySQL Cluster]
        REDIS[Redis Cache]
        MONITORING[Monitoring & Logs]
    end
    
    subgraph "External Services"
        OPENAI_PROD[OpenAI API]
        EMAIL_PROD[Email Service]
    end
    
    CDN --> LB
    LB --> APP_SERVERS
    APP_SERVERS --> DB_CLUSTER
    APP_SERVERS --> REDIS
    APP_SERVERS --> OPENAI_PROD
    APP_SERVERS --> EMAIL_PROD
    APP_SERVERS --> MONITORING
```

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/verify-email` | Email verification |
| POST | `/api/auth/verify-2fa` | 2FA verification |
| POST | `/api/auth/2fa/setup/email` | Setup email 2FA |
| POST | `/api/auth/2fa/setup/totp` | Setup TOTP 2FA |
| POST | `/api/auth/2fa/verify-setup` | Verify 2FA setup |
| POST | `/api/auth/2fa/disable` | Disable 2FA |

### User Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PATCH | `/api/user/profile` | Update user profile |
| GET | `/api/notifications` | Get user notifications |
| PATCH | `/api/notifications/:id/read` | Mark notification as read |

### Chat Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/sessions` | Create chat session |
| GET | `/api/chat/sessions` | Get user chat sessions |
| GET | `/api/chat/sessions/:id/messages` | Get session messages |

### Lawyer Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lawyers` | Get lawyers list |
| GET | `/api/lawyers/:id` | Get lawyer details |
| POST | `/api/lawyers/rating` | Rate a lawyer |

### WebSocket Events

| Event | Description | Payload |
|-------|-------------|---------|
| `auth` | Authentication | `{token, userId}` |
| `chat_message` | Send message | `{sessionId, content}` |
| `ai_response` | AI response | `{sessionId, message}` |
| `message_sent` | Message confirmation | `{messageId}` |
| `error` | Error notification | `{message}` |

---

## Performance Considerations

### Database Optimization
- UUID primary keys for security and distribution
- Proper indexing on frequently queried columns
- JSON columns for flexible schema evolution
- Connection pooling for efficient resource usage

### Caching Strategy
- Redis for session storage
- API response caching for lawyer listings
- Client-side caching with TanStack Query

### Security Measures
- JWT tokens with 7-day expiration
- bcrypt password hashing with salt rounds
- Rate limiting on authentication endpoints
- Input validation and sanitization
- SQL injection prevention with ORM

### Scalability Features
- Horizontal scaling with load balancers
- Database read replicas for query distribution
- WebSocket clustering for real-time features
- CDN for static asset delivery

---

## Monitoring and Analytics

### Application Metrics
- Response time monitoring
- Error rate tracking
- User session analytics
- Database performance metrics

### Security Monitoring
- Failed authentication attempts
- 2FA bypass attempts
- Unusual access patterns
- API rate limit violations

### Business Metrics
- User registration rates
- Chat session engagement
- Lawyer profile completions
- AI response accuracy feedback

---

This architecture documentation provides a comprehensive overview of the LawHelp system, covering all major components, data flows, security measures, and deployment strategies. The system is designed for scalability, security, and user experience while maintaining compliance with legal industry standards.