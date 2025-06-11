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
1. **Real Implementation First** - Always start with actual database and API integration
2. **No Mock Data Phase** - Skip all mock data creation, go directly to real data implementation
3. **Database-First Approach** - Set up actual D1 database schema before frontend implementation
4. **Authentication Integration** - Connect Clerk authentication before building protected features
5. **Test with Real Data** - Use actual user scenarios and real data for testing
6. **Error Handling Priority** - Implement proper error handling for all real data operations
7. **Code Quality Focus** - Prioritize working implementations over placeholder solutions

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

### AI Decision-making Standards

### Priority Decision Tree
1. **Real Implementation Priority**: Always choose real database integration over mock solutions
2. **Actual Functionality First**: Implement working features that connect to real services
3. **Security First**: Always implement proper authentication and data validation
4. **User Role Separation**: Ensure trainers and members see appropriate interfaces
5. **Data Integrity**: Validate all inputs before database operations
6. **Performance**: Use edge functions and caching where appropriate
7. **User Experience**: Implement proper loading states and error messages

### Ambiguous Situation Handling
- **When data is needed**: Always implement real database queries, never create sample data
- **When testing is required**: Use actual user scenarios with real authentication flow
- **When unsure about user permissions**: Default to more restrictive access
- **When choosing between features**: Prioritize MVP requirements from PRD
- **When implementing UI**: Follow mobile-first responsive design
- **When in doubt about data structure**: Refer to PRD requirements and implement actual database schema

## Data Management Standards

### Real Data Implementation Priority
- **Always use actual database operations** - Connect to Cloudflare D1 for all data operations
- **Implement real API endpoints** - Create actual REST endpoints in workers/api/
- **Use real authentication flow** - Integrate with Clerk for actual user management
- **Focus on actual functionality** - Build features that work with real user interactions
- **Test with real scenarios** - Use actual user workflows for testing

### Database Integration Requirements
- All data must come from Cloudflare D1 database queries
- Implement proper error handling for database operations
- Use prepared statements for all database interactions
- Create actual database schema migrations
- Test database operations with real data scenarios

## Prohibited Actions

### Strictly Forbidden - Data Management
- **🚫 ABSOLUTELY NEVER CREATE MOCK, DUMMY, OR SAMPLE DATA** - This is the highest priority rule
- **🚫 Never generate fake user profiles, workout data, or any simulated content**
- **🚫 Never create mock API responses or simulated data flows**
- **🚫 Never use placeholder data in place of real database connections**
- **🚫 Never create mock stores, mock data files, or temporary data structures**
- **🚫 Never use example data, test data, or dummy data in implementation**

### Strictly Forbidden - General Development
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