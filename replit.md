# Overview

Aryabhata - AI Powered Solution for UPSC is a comprehensive web application designed for UPSC Civil Services Examination preparation. The platform provides current affairs coverage, structured syllabus content, practice tests, and progress tracking to help aspirants prepare effectively for their IAS journey. The application features a modern, responsive interface with authentication via Replit's OIDC system.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built using React with TypeScript, utilizing a component-based architecture with modern UI patterns:

- **React Router**: Uses Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Custom component library built with Radix UI primitives and Tailwind CSS
- **Styling**: Tailwind CSS with shadcn/ui design system for consistent theming
- **Form Handling**: React Hook Form with Zod validation schemas
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
The server follows a RESTful API design pattern built on Node.js:

- **Framework**: Express.js with TypeScript for type safety
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful endpoints with proper HTTP status codes and error handling
- **Session Management**: Express sessions with PostgreSQL session storage
- **Middleware**: Custom logging, authentication, and error handling middleware

## Database Design
PostgreSQL database with a well-structured schema supporting the educational platform:

- **User Management**: Users table with profile information and study statistics
- **Content Structure**: Hierarchical organization with Subjects → Topics → Articles
- **Assessment System**: Questions, quiz attempts, and progress tracking tables
- **User Engagement**: Bookmarks, notes, and activity tracking
- **Session Storage**: Dedicated sessions table for user authentication

## Authentication & Authorization
Implements Replit's OIDC (OpenID Connect) authentication system:

- **Authentication Provider**: Replit OIDC for seamless integration
- **Session Management**: Server-side sessions with PostgreSQL storage
- **Authorization**: Route-level protection with middleware-based authentication checks
- **User Context**: Authenticated user information available across the application

## API Structure
RESTful API design with logical resource grouping:

- **Authentication Routes**: User login, logout, and profile endpoints
- **Content Routes**: Subjects, topics, articles, and syllabus management
- **Assessment Routes**: Questions, quizzes, and practice test functionality  
- **User Data Routes**: Bookmarks, notes, progress tracking, and activity logs
- **Error Handling**: Consistent error responses with proper HTTP status codes

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18 with TypeScript, Wouter for routing, TanStack Query for data fetching
- **Backend Runtime**: Node.js with Express framework and TypeScript support
- **Build & Development**: Vite for frontend bundling, tsx for TypeScript execution

## Database & ORM
- **Database**: PostgreSQL via Neon serverless database service
- **ORM**: Drizzle ORM with Drizzle Kit for migrations and schema management
- **Connection**: @neondatabase/serverless for optimized database connectivity

## UI & Styling
- **Component Library**: Radix UI primitives for accessible, headless components
- **Styling**: Tailwind CSS with custom design tokens and shadcn/ui components
- **Icons**: Lucide React for consistent iconography
- **Utilities**: class-variance-authority for component variants, clsx for conditional classes

## Authentication & Session Management
- **OIDC Provider**: Replit's OpenID Connect system for user authentication
- **Session Storage**: connect-pg-simple for PostgreSQL-backed session management
- **Passport Integration**: passport and openid-client for authentication flow

## Development & Production Tools
- **Type Safety**: TypeScript with strict configuration and Zod for runtime validation
- **Code Quality**: ESBuild for production bundling, PostCSS for CSS processing
- **Development Experience**: Replit-specific plugins for error handling and debugging
- **Environment**: WebSocket support via ws library for real-time features