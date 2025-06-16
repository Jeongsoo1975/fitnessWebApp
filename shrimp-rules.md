# FitnessWEBAPP Development Guidelines

## Project Overview

- **Technology Stack**: Next.js 15.2.3, React 19, TypeScript 5.7.2, Clerk Authentication, Tailwind CSS
- **Architecture**: Component-based React application with role-based access control (trainer/member)
- **Primary Purpose**: React Hooks 의존성 문제 해결 및 코드 품질 개선

## React Hooks Dependency Management

### Critical Rules for useEffect Dependencies

- **MUST**: Include ALL variables, functions, and state used inside useEffect in dependency array
- **MUST**: Use useCallback for functions referenced in useEffect dependencies
- **MUST**: Use useMemo for computed values referenced in useEffect dependencies
- **PROHIBITED**: Empty dependency arrays unless effect should run only once on mount

### useCallback Implementation Standards

- **REQUIRED**: Wrap API call functions in useCallback when used in useEffect
- **REQUIRED**: Include primitive dependencies (user?.id, role) in useCallback dependency array
- **REQUIRED**: Avoid object dependencies in useCallback (extract primitive values)

#### Correct Pattern:
```typescript
const fetchData = useCallback(async () => {
  if (!user?.id || !role) return
  // API call logic
}, [user?.id, role])

useEffect(() => {
  fetchData()
}, [fetchData])
```

#### Prohibited Pattern:
```typescript
// ❌ Missing useCallback
const fetchData = async () => {
  // API call logic
}

useEffect(() => {
  fetchData() // Will cause infinite re-renders
}, [fetchData])
```

### useMemo Usage Rules

- **REQUIRED**: Use useMemo for expensive computations referenced in useEffect
- **REQUIRED**: Use useMemo for complex object/array dependencies in useEffect
- **PROHIBITED**: Overuse of useMemo for simple calculations

## Clerk Authentication Patterns

### Required Hook Usage

- **MUST**: Use `useUser()` from @clerk/nextjs for user data
- **MUST**: Use custom `useUserRole()` from @/hooks/useAuth for role checking
- **MUST**: Use `useAuth()` from @clerk/nextjs for token access
- **PROHIBITED**: Direct access to Clerk context without proper hooks

### Authentication State Handling

- **REQUIRED**: Check `isLoaded` before accessing user data
- **REQUIRED**: Handle loading states in components
- **REQUIRED**: Use role-based conditional rendering

#### Correct Pattern:
```typescript
const { user, isLoaded } = useUser()
const { role, isLoading } = useUserRole()

if (!isLoaded || isLoading) return <LoadingSpinner />
if (!user || !role) return <AuthRequired />
```

## API Call Patterns

### Standard API Request Structure

- **REQUIRED**: Include Clerk token in Authorization header
- **REQUIRED**: Include user ID and role in request headers when needed
- **REQUIRED**: Handle loading and error states
- **PROHIBITED**: Direct fetch calls without proper error handling

#### Required Headers Pattern:
```typescript
const headers = {
  'Authorization': `Bearer ${await getToken()}`,
  'x-clerk-user-id': user?.id || '',
  'x-user-role': role || ''
}
```

### Error Handling Standards

- **REQUIRED**: Try-catch blocks for all async operations
- **REQUIRED**: User-friendly error messages
- **REQUIRED**: Console logging for debugging
- **PROHIBITED**: Silent failure of API calls

## Component Architecture Rules

### File Organization

- **REQUIRED**: Components in `/src/components/[domain]/`
- **REQUIRED**: Custom hooks in `/src/hooks/`
- **REQUIRED**: Types in `/src/types/`
- **REQUIRED**: Utilities in `/src/lib/`

### Component Structure Standards

- **REQUIRED**: 'use client' directive for client-side components
- **REQUIRED**: Interface definitions before component
- **REQUIRED**: Props interface naming: `[ComponentName]Props`
- **REQUIRED**: Default export for main component

### State Management

- **REQUIRED**: useState for local component state
- **REQUIRED**: Separate loading, error, and data states
- **PROHIBITED**: Complex state objects (use multiple useState calls)

## TypeScript Standards

### Type Definition Rules

- **REQUIRED**: Interface definitions in `/src/types/` for shared types
- **REQUIRED**: Inline interfaces for component-specific props
- **REQUIRED**: Explicit return types for custom hooks
- **PROHIBITED**: `any` type usage

### Import/Export Standards

- **REQUIRED**: Named exports for utilities and types
- **REQUIRED**: Default exports for React components
- **REQUIRED**: Absolute imports using `@/` prefix

## Prohibited Actions

### Data Handling

- **STRICTLY PROHIBITED**: Creating dummy/mock/sample data
- **STRICTLY PROHIBITED**: Generating arbitrary test data
- **STRICTLY PROHIBITED**: Using placeholder values without explicit user request

### Code Patterns

- **PROHIBITED**: useEffect without dependency array for recurring effects
- **PROHIBITED**: Inline object/array creation in dependency arrays
- **PROHIBITED**: Nested async functions in useEffect
- **PROHIBITED**: Direct DOM manipulation (use React patterns)

### Development Practices

- **PROHIBITED**: Commenting out code instead of removing
- **PROHIBITED**: Console.log statements in production code
- **PROHIBITED**: Hardcoded values (use constants or environment variables)

## Multi-File Coordination Rules

### Component Modifications

- **REQUIRED**: When modifying component props, update parent components
- **REQUIRED**: When adding new props, update TypeScript interfaces
- **REQUIRED**: When changing API responses, update related types

### API Changes

- **REQUIRED**: Update component error handling when API structure changes
- **REQUIRED**: Update type definitions when API responses change
- **REQUIRED**: Update loading states when API flow changes

## Git Workflow Standards

### Commit Requirements

- **REQUIRED**: Git add and commit after file modifications
- **REQUIRED**: Use conventional commit messages (feat:, fix:, refactor:)
- **REQUIRED**: Test branch creation before main branch merge
- **PROHIBITED**: Direct commits to main branch without testing

### Branch Management

- **REQUIRED**: Create test branch for feature development
- **REQUIRED**: Verify functionality before merging to main
- **REQUIRED**: Pull request workflow for significant changes

## AI Decision-Making Priorities

### Issue Resolution Order

1. **React Hooks dependency issues** (highest priority)
2. **Authentication/authorization bugs**
3. **API integration problems**
4. **UI/UX improvements**
5. **Performance optimizations**

### Ambiguous Situation Handling

- **PRIMARY**: Check existing patterns in codebase
- **SECONDARY**: Refer to this rules document
- **TERTIARY**: Apply React best practices
- **LAST RESORT**: Ask user for clarification

### Error Recovery

- **IMMEDIATE**: Fix React Hook dependency warnings
- **URGENT**: Resolve TypeScript compilation errors
- **HIGH**: Fix runtime JavaScript errors
- **MEDIUM**: Address ESLint warnings

## Key File Interaction Matrix

### Critical File Dependencies

| Primary File | Required Updates | Reason |
|--------------|------------------|---------|
| `/src/components/schedule/ScheduleCalendar.tsx` | `/src/types/workout.ts` | Schedule interface changes |
| `/src/components/member/TrainerMemberManager.tsx` | `/src/types/user.ts` | Member interface changes |
| `/src/hooks/useAuth.ts` | All auth-dependent components | Authentication flow changes |
| `package.json` | `/next.config.ts`, `tsconfig.json` | Dependency updates |

### Simultaneous Update Requirements

- **Authentication hooks** → Update all components using auth
- **API response types** → Update consuming components
- **Global styles** → Update component className usage
- **Environment variables** → Update related configuration files

## Performance Optimization Rules

### Re-render Prevention

- **REQUIRED**: Use React.memo for expensive components
- **REQUIRED**: Optimize useCallback and useMemo usage
- **REQUIRED**: Avoid creating objects in render methods
- **PROHIBITED**: Unnecessary prop drilling

### Bundle Optimization

- **REQUIRED**: Dynamic imports for heavy components
- **REQUIRED**: Tree shaking friendly exports
- **PROHIBITED**: Importing entire libraries for single functions

## Testing Requirements

### Component Testing

- **REQUIRED**: Test React Hook dependencies
- **REQUIRED**: Test authentication state changes
- **REQUIRED**: Test API error scenarios
- **PROHIBITED**: Testing implementation details over behavior

### Integration Testing

- **REQUIRED**: Test multi-component workflows
- **REQUIRED**: Test role-based access control
- **REQUIRED**: Test data flow integrity