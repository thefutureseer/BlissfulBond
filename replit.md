# Spirit Love Play App

## Overview

Spirit Love Play is a romantic relationship journaling and task management application designed specifically for Daniel and Pacharee. The app features a celestial, mystical theme with rose-gold aesthetics and provides tools for capturing meaningful moments, managing relationship goals, and tracking emotional sentiment through AI-powered analysis.

The application is built as a full-stack web application with offline-first capabilities, allowing users to maintain their relationship journal and tasks even without an internet connection. It emphasizes a romantic, elegant user experience with custom animations, gradient backgrounds, and thoughtful visual details.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (no React Router dependency)
- Path aliases configured for clean imports (`@/`, `@shared/`, `@assets/`)

**UI Component System**
- shadcn/ui component library (New York style variant) for consistent design patterns
- Radix UI primitives for accessible, unstyled component foundations
- Custom components built on top: MomentCard, TaskCard, HeartProgress, Confetti
- Tailwind CSS for utility-first styling with custom theme configuration

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management and caching
- Local state management via React hooks
- LocalStorage integration for offline persistence and autosave functionality
- Query client configured with infinite stale time and disabled refetching for offline-first behavior

**Animation & Visual Effects**
- Framer Motion for declarative animations and transitions
- Custom confetti particle system with rose-gold color palette
- Heart pulse animations and gradient effects
- Recharts for data visualization (sentiment trends, emotion distribution)

**Design System**
- Typography: Dancing Script (romantic headers), Poppins (body text)
- Color palette: Rose-to-amber gradient (`from-rose-400 via-pink-200 to-amber-300`)
- Custom CSS variables for theming with light/dark mode support
- Consistent spacing using Tailwind's spacing scale

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for the REST API
- ESM (ES Modules) throughout the codebase
- Custom middleware for request logging and JSON body parsing
- Vite middleware integration for development hot module replacement

**Database Layer**
- PostgreSQL database via Neon serverless
- Drizzle ORM for type-safe database queries and schema management
- WebSocket connection pooling for serverless compatibility
- Schema-first approach with automatic TypeScript type inference

**Data Models**
- **Users**: Stores Daniel and Pacharee's profiles with auto-generated UUIDs
- **Moments**: Journal entries with content, timestamps, and AI-analyzed sentiment
- **Tasks**: Categorized action items with completion status

**API Design**
- RESTful endpoints following resource-based patterns
- POST `/api/users/:name` - Get or create user by name
- GET `/api/users/:userId/moments` - Retrieve user's moments
- POST `/api/moments` - Create moment with automatic sentiment analysis
- GET `/api/users/:userId/tasks` - Retrieve user's tasks
- POST `/api/tasks` - Create new task
- PATCH `/api/tasks/:id` - Update task (toggle completion)
- DELETE `/api/tasks/:id` - Remove task

**Validation & Type Safety**
- Zod schemas derived from Drizzle table definitions
- Request validation using drizzle-zod integration
- Shared types between frontend and backend via `@shared` directory
- Runtime validation for all user inputs

### External Dependencies

**AI Integration**
- OpenAI GPT-5 for sentiment analysis via Replit's AI Integrations service
- Sentiment analysis returns:
  - Emotional score (-1 to 1 range)
  - Label classification (very positive, positive, neutral, negative)
  - Detected emotions array (joy, love, gratitude, etc.)
- JSON-structured responses for reliable parsing
- Environment variables for API key management (`AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`)

**Database Service**
- Neon PostgreSQL serverless database
- Connection via `DATABASE_URL` environment variable
- WebSocket support through `ws` package for serverless compatibility
- Connection pooling for efficient resource usage

**Third-Party UI Libraries**
- Radix UI components (20+ primitives): Dialog, Dropdown, Popover, Toast, etc.
- React Hook Form with Hookform Resolvers for form validation
- Lucide React for consistent iconography
- Recharts for analytics visualizations
- cmdk for command palette interfaces

**Development Tools**
- Replit-specific plugins: vite-plugin-runtime-error-modal, cartographer, dev-banner
- ESBuild for production server bundling
- PostCSS with Autoprefixer for CSS processing
- Drizzle Kit for database migrations

**Deployment Configuration**
- Build process: Vite builds frontend to `dist/public`, ESBuild bundles server to `dist`
- Production server serves static files and API endpoints
- Environment-based configuration (NODE_ENV for dev/production switching)
- Replit deployment integration with auto-provisioning