# Futuristic Productivity Dashboard

## Overview

This is a modern productivity dashboard application built with React, Express, and PostgreSQL. The application provides users with task management, calendar integration, meeting scheduling, goal tracking, and an AI-powered chatbot assistant. It features a futuristic design aesthetic with soft gradients, smooth animations, and calm, focused layouts inspired by tools like Notion, Linear, and Asana.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- React Router (wouter) for lightweight client-side routing

**UI Component Strategy:**
- shadcn/ui component library built on Radix UI primitives for accessible, composable components
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for type-safe component variants
- Custom design system defined in `design_guidelines.md` featuring:
  - Poppins font for modern, friendly typography
  - Generous spacing using Tailwind units (3, 4, 6, 8, 12, 16)
  - Soft shadows and rounded corners (rounded-xl, rounded-2xl)
  - Hover elevation effects and smooth transitions

**State Management:**
- TanStack Query (React Query) for server state management, caching, and synchronization
- Custom query client configuration with strict cache control and error handling
- React Hook Form with Zod resolvers for form state and validation

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript running on Node.js
- HTTP server using native Node `http` module for potential WebSocket upgrades
- Custom logging middleware for request/response tracking
- Raw body parsing for webhook support (e.g., Stripe)

**Authentication & Session Management:**
- Replit OIDC authentication for seamless integration with Replit platform
- Passport.js strategy for OpenID Connect flows
- PostgreSQL-backed session storage using `connect-pg-simple`
- Session cookies with 1-week TTL, HTTP-only and secure flags

**API Design:**
- RESTful API endpoints under `/api` prefix
- Authentication middleware protecting routes with `isAuthenticated` guard
- Structured error handling with appropriate HTTP status codes
- User context injected via `req.user.claims.sub` for multi-tenant data isolation

### Data Storage

**Database:**
- PostgreSQL database via Neon serverless driver with WebSocket support
- Drizzle ORM for type-safe database queries and schema management
- Migration system using `drizzle-kit` with schemas stored in `shared/schema.ts`

**Schema Design:**
- Multi-tenant architecture with all entities scoped to `userId`
- Core entities:
  - `users`: User profiles from OIDC authentication
  - `tasks`: Task items with priority, status, category, and due dates
  - `meetings`: Calendar events with scheduling information
  - `goals`: User goals with progress tracking
  - `notifications`: System notifications for user alerts
  - `chatMessages`: Conversation history for AI chatbot
  - `focusSessions`: Productivity tracking sessions
  - `sessions`: PostgreSQL session storage table
- Cascade deletes on user removal to maintain referential integrity
- Timestamp tracking (`createdAt`, `updatedAt`) on all entities

### External Dependencies

**AI Integration:**
- OpenAI API for chatbot functionality using GPT-5 model (as of August 2025)
- API key managed via environment variables

**Third-Party UI Libraries:**
- Radix UI primitives (20+ components) for headless, accessible UI building blocks
- Lucide React for consistent icon system
- date-fns for date manipulation and formatting
- embla-carousel for carousel functionality
- recharts for data visualization (chart components)

**Development Tools:**
- ESBuild for server bundling with selective dependency bundling
- TypeScript for static type checking across frontend and backend
- Replit-specific plugins for development environment integration:
  - Runtime error modal overlay
  - Cartographer for code navigation
  - Development banner

**Environment Configuration:**
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Session encryption key (required)
- `OPENAI_API_KEY`: OpenAI API access (required)
- `ISSUER_URL`: OIDC issuer endpoint (defaults to Replit)
- `REPL_ID`: Replit environment identifier

### Deployment Strategy

**Build Process:**
- Client builds to `dist/public` via Vite
- Server bundles to `dist/index.cjs` via ESBuild
- Selective server dependency bundling to reduce cold start times
- Production mode uses pre-built static assets served by Express

**Development Mode:**
- Vite middleware integration for HMR
- Dynamic HTML template injection with cache-busting
- Separate Vite HMR WebSocket endpoint