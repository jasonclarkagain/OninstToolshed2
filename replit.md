# OSINT Tool Shed

## Overview

This is a comprehensive OSINT (Open Source Intelligence) tool suite built as a full-stack web application. The application provides various intelligence-gathering tools for cybersecurity professionals and researchers, including domain enumeration, IP analysis, WHOIS lookups, and social media intelligence gathering.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom dark theme
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript throughout the entire stack
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful APIs with structured error handling
- **Session Management**: PostgreSQL session store with express-session

### Monorepo Structure
The application follows a monorepo pattern with clear separation:
- `/client` - React frontend application
- `/server` - Express.js backend API
- `/shared` - Shared types, schemas, and utilities

## Key Components

### OSINT Tools
The application provides multiple intelligence-gathering tools:

1. **Domain & Network Tools**
   - Domain enumeration with subdomain discovery
   - IP address analysis with geolocation
   - WHOIS domain registration lookups
   - Network tools (ping, traceroute, port scanning)

2. **Social & Identity Tools**
   - Username availability checking across platforms
   - Email validation and breach checking

3. **Data Analysis Tools**
   - Hash analysis and identification
   - Base64 encoding/decoding
   - URL safety analysis

4. **Search & Investigation Tools**
   - Google dorking query generator

5. **Advanced Security Framework**
   - Kali Linux virtual machine with full terminal access
   - Metasploit exploitation framework interface
   - Social engineering toolkit and assessment tools
   - Comprehensive vulnerability scanner with CVE database
   - OSINT framework with 40+ reconnaissance tools

### Enterprise Features

6. **Intelligence Dashboard**
   - Real-time threat intelligence feeds from multiple sources
   - Visual network mapping and topology analysis
   - Automated correlation between different tool results
   - Live security monitoring with severity-based alerting

7. **Advanced Reporting Engine**
   - Professional penetration testing report generation
   - Multiple export formats (PDF, DOCX, JSON, XML)
   - Executive summary with risk ratings and recommendations
   - Customizable templates for different audiences

8. **Workflow Automation**
   - Chain multiple tools together for comprehensive assessments
   - Custom scan profiles (Quick, Comprehensive, Stealth, Aggressive)
   - Scheduled automated reconnaissance scans
   - Workflow step management with delay configurations

9. **Performance Analytics Dashboard**
   - Real-time system monitoring with CPU, memory, and network metrics
   - Tool performance analysis with success rates and execution times
   - Intelligent alerting system with configurable thresholds
   - AI-powered insights and optimization recommendations

10. **Team Collaboration Workspace**
    - Real-time collaboration with @mentions and notifications
    - Shared investigations and workspace management
    - Comment system for findings and evidence discussion
    - Advanced sharing controls with role-based permissions

11. **Advanced Search & Filtering**
    - Natural language search across all OSINT data
    - Advanced filtering by tool type, severity, and date ranges
    - Saved searches and query templates
    - Cross-correlation and pattern analysis

12. **AI-Powered Security Analysis**
    - Intelligent vulnerability assessment and risk scoring
    - Natural language queries for security analysis
    - Automated threat correlation and pattern recognition
    - AI-generated security recommendations and insights

13. **Mobile-Responsive Dashboard**
    - Optimized mobile interface for on-the-go monitoring
    - Quick action buttons for emergency responses
    - Real-time alert notifications and system status
    - Streamlined mobile workflow management

### Database Schema
The application uses an enhanced database schema with six main tables:

1. **Users**: User authentication and management with role-based access
2. **OSINT Queries**: Stores all tool execution results and metadata with detailed tracking
3. **OSINT Reports**: Professional report generation with versioning and export capabilities
4. **Tool Configs**: User-specific configurations for different OSINT tools
5. **API Keys**: Secure storage for external service credentials
6. **Audit Logs**: Comprehensive activity tracking for security and compliance

### Authentication System
- Simple username/password authentication
- Session-based authentication with PostgreSQL storage
- User isolation for queries and reports

## Data Flow

1. **User Interaction**: Users interact with tool components in the React frontend
2. **API Requests**: Frontend makes API calls to Express.js backend endpoints
3. **Tool Execution**: Backend services execute OSINT tools and gather intelligence
4. **Data Storage**: Results are stored in PostgreSQL with user association
5. **Real-time Updates**: TanStack Query provides real-time result updates via polling

## External Dependencies

### Frontend Dependencies
- **UI Components**: Extensive use of Radix UI primitives
- **Styling**: Tailwind CSS with custom theming
- **State Management**: TanStack Query for API state
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React icon library

### Backend Dependencies
- **Database**: Neon Database (serverless PostgreSQL)
- **ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod for schema validation
- **Session Storage**: connect-pg-simple for PostgreSQL session storage

### Development Tools
- **Build System**: Vite for frontend, esbuild for backend
- **Type Checking**: TypeScript with strict configuration
- **Database Migrations**: Drizzle Kit for schema management
- **Development Environment**: Optimized for Replit with hot reloading

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx with automatic restart on file changes
- **Database**: Neon Database with connection pooling
- **Environment Variables**: DATABASE_URL for database connection

### Production Build
- **Frontend**: Vite build outputs to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves built frontend files
- **Database**: Production PostgreSQL with migrations via Drizzle

### Key Features
- **Responsive Design**: Mobile-first responsive layout
- **Dark Theme**: Custom dark theme implementation
- **Error Handling**: Comprehensive error boundaries and API error handling
- **Performance**: Optimized with React Query caching and Vite bundling
- **Security**: Input validation, session management, and CSRF protection

The application is designed to be a comprehensive OSINT toolkit while maintaining clean architecture, type safety, and excellent developer experience.