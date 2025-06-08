# FitnessWebApp Development Guidelines

## Project Overview

- **Purpose**: Web-based Personal Training management app for trainers and members
- **Tech Stack**: Next.js 15, TypeScript, Cloudflare Workers, Cloudflare D1, Clerk Auth
- **Target Users**: Trainers (PT management) and Members (workout tracking)
- **Architecture**: Serverless full-stack with edge computing

## Project Architecture Rules

### Directory Structure
- Use `src/` as main source directory
- Create `src/app/` for Next.js App Router pages
- Create `src/components/` for reusable UI components
- Create `src/lib/` for utilities and database functions
- Create `src/types/` for TypeScript type definitions
- Create `src/hooks/` for custom React hooks
- Create `workers/` for Cloudflare Workers API endpoints
- Create `database/` for D1 schema and migrations

### File Organization
- Group related files in feature-based folders
- Separate trainer and member specific components in `src/components/trainer/` and `src/components/member/`
- Place shared components in `src/components/shared/`
- Store database schemas in `database/schema.sql`
- Store API functions in `workers/api/`

## Code Standards

### Naming Conventions
- Use kebab-case for file names: `workout-schedule.tsx`, `diet-management.tsx`
- Use PascalCase for React components: `WorkoutSchedule`, `DietManagement`
- Use camelCase for variables and functions: `getUserWorkouts`, `sessionCount`
- Use UPPER_SNAKE_CASE for environment variables: `DATABASE_URL`, `CLERK_SECRET_KEY`

### TypeScript Rules
- Define all props interfaces with `Props` suffix: `WorkoutScheduleProps`
- Create type definitions for all database entities in `src/types/`
- Use strict type checking for all API responses
- Define user role types: `type UserRole = 'trainer' | 'member'`

### Component Structure
- Use functional components with TypeScript
- Implement proper prop validation with interfaces
- Use React hooks for state management
- Separate business logic into custom hooks

## Functionality Implementation Standards

### Authentication with Clerk
- Use Clerk's `useUser()` hook for user data access
- Implement role-based routing in `src/app/layout.tsx`
- Store user roles in Clerk's user metadata
- Create protected routes for trainer-only features
- Use Clerk's `SignIn`, `SignUp` components without customization

### Database Operations
- Use Cloudflare D1 for all data storage
- Create database connection utility in `src/lib/db.ts`
- Implement prepared statements for all queries
- Use transactions for multi-table operations
- Store all schema definitions in `database/schema.sql`

### API Endpoints
- Create RESTful endpoints in `workers/api/`
- Use proper HTTP methods: GET, POST, PUT, DELETE
- Implement authentication middleware for all protected routes
- Return consistent JSON response format
- Handle errors with appropriate HTTP status codes

## Framework/Library Usage Standards

### Next.js Specific Rules
- Use App Router exclusively (not Pages Router)
- Implement Server Components where possible
- Use Client Components only when interactivity is required
- Store environment variables in `.env.local`
- Use Next.js Image component for all images

### Cloudflare Integration
- Deploy frontend to Cloudflare Pages
- Deploy API to Cloudflare Workers
- Use Cloudflare D1 for database operations
- Configure wrangler.toml for deployment settings
- Use Cloudflare's edge functions for performance

### UI Components
- Use Tailwind CSS for all styling
- Implement responsive design mobile-first
- Create reusable component library in `src/components/ui/`
- Use consistent color scheme throughout the app
- Implement proper loading states and error handling

## Workflow Standards

### Development Process
1. Create feature branch from main
2. Implement functionality following these rules
3. Test all user interactions thoroughly
4. Commit with conventional commit messages
5. Create pull request for code review
6. Merge only after successful testing

### Database Migration Process
1. Create migration files in `database/migrations/`
2. Test migrations on local D1 instance
3. Apply migrations to production D1
4. Update schema documentation

## Key File Interaction Standards

### Critical File Dependencies
- When modifying `src/types/user.ts`, update `workers/api/auth.ts`
- When changing database schema in `database/schema.sql`, update `src/types/` accordingly
- When adding new API endpoints, update `src/lib/api.ts` client functions
- When modifying user roles, update both Clerk configuration and type definitions

### Multi-file Coordination Requirements
- Authentication changes require updates to: `src/lib/auth.ts`, `workers/api/auth.ts`, `src/types/user.ts`
- New database tables require: schema update, type definitions, API endpoints, and client functions
- UI component changes must maintain consistency across trainer and member interfaces

## AI Decision-making Standards

### Priority Decision Tree
1. **Security First**: Always implement proper authentication and data validation
2. **User Role Separation**: Ensure trainers and members see appropriate interfaces
3. **Data Integrity**: Validate all inputs before database operations
4. **Performance**: Use edge functions and caching where appropriate
5. **User Experience**: Implement proper loading states and error messages

### Ambiguous Situation Handling
- When unsure about user permissions, default to more restrictive access
- When choosing between features, prioritize MVP requirements from PRD
- When implementing UI, follow mobile-first responsive design
- When in doubt about data structure, refer to PRD requirements

## Prohibited Actions

### Strictly Forbidden
- **Never create mock or dummy data** - Use only real data from user inputs
- **Never implement features not specified in PRD** - Stick to documented requirements
- **Never bypass authentication checks** - All protected routes must verify user identity
- **Never store sensitive data in plain text** - Use proper encryption and secure storage
- **Never ignore TypeScript errors** - Fix all type issues before proceeding
- **Never use Pages Router** - Only use App Router for Next.js routing
- **Never hardcode configuration values** - Use environment variables for all settings
- **Never implement features without proper error handling** - All operations must handle failures gracefully

### Security Prohibitions
- Never expose database credentials in client-side code
- Never skip input validation on API endpoints
- Never store passwords in plain text
- Never implement admin functionality without proper role checks
- Never allow cross-user data access without permission verification

### Development Prohibitions
- Never commit sensitive information to version control
- Never deploy without testing authentication flows
- Never modify production database directly
- Never override TypeScript strict mode
- Never use deprecated Clerk methods or components

## MVP Feature Implementation Order

### Phase 1 (Authentication & Basic Structure)
1. Set up Clerk authentication with role selection
2. Create basic project structure
3. Set up Cloudflare D1 database
4. Implement user role-based routing

### Phase 2 (Core Features)
1. Trainer-member relationship management
2. PT session management with signature feature
3. Basic workout schedule management
4. Simple progress tracking (weight/measurements)

### Phase 3 (Enhanced Features)
1. Diet management with photo upload
2. Advanced progress tracking with charts
3. Notification system
4. Report generation for trainers