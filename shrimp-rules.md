# FitnessWebApp Development Guidelines

## Project Overview

**Technology Stack**: Next.js 15 + Cloudflare D1 + Cloudflare Workers + Clerk Auth + TypeScript  
**Architecture**: Frontend (Next.js App Router) + Backend (Cloudflare Workers) + Database (D1)  
**Core Functionality**: 트레이너-회원 관계 관리, 운동 스케줄링, PT 세션 관리, 식단 관리

## Critical Development Rules

### **🚫 ABSOLUTELY PROHIBITED**

- **Mock 데이터 생성 금지**: 절대로 임시 데이터, 더미 데이터, 샘플 데이터 생성 불가
- **localStorage 사용 금지**: 프론트엔드에서 데이터 저장 시 localStorage 사용 불가 (Cloudflare D1만 사용)
- **직접 파일 시스템 접근 금지**: 서버 환경에서 JSON 파일 읽기/쓰기 금지
- **타입 추측 금지**: TypeScript 타입이 불명확하면 src/types/ 파일들을 확인 후 정확한 타입 사용
- **API 라우트 임의 생성 금지**: src/app/api/ 구조를 반드시 확인 후 기존 패턴 따라 구현

### **📊 Database Operations**

#### **Database Connection Pattern**
- **MUST USE**: `src/lib/db.ts`의 `DatabaseManager` 클래스만 사용
- **MUST IMPORT**: `createDatabaseManager` 함수로 DB 인스턴스 생성
- **Environment Access**: Cloudflare Workers 환경에서 `env.DB` 접근

```typescript
// ✅ CORRECT Pattern
import { createDatabaseManager, type DatabaseEnv } from '@/lib/db'
const dbManager = createDatabaseManager(env)
const users = await dbManager.query<User>('SELECT * FROM users WHERE role = ?', ['trainer'])

// ❌ WRONG Pattern
const db = env.DB.prepare('SELECT * FROM users')  // 직접 접근 금지
```

#### **Query Implementation Rules**
- **Prepared Statements 필수**: SQL 인젝션 방지를 위해 모든 쿼리에 매개변수 바인딩 사용
- **Type Safety 필수**: 모든 쿼리 결과에 TypeScript 제네릭 타입 지정
- **Error Handling 필수**: try-catch 블록으로 데이터베이스 에러 처리

```typescript
// ✅ CORRECT Query Pattern
const result = await dbManager.query<User>(
  'SELECT * FROM users WHERE clerk_id = ? AND role = ?',
  [clerkId, 'trainer']
)

// ❌ WRONG Query Pattern  
const result = await dbManager.query(`SELECT * FROM users WHERE clerk_id = '${clerkId}'`)
```

#### **Type Definitions**
- **MUST USE**: `src/lib/db.ts`에 정의된 인터페이스만 사용
- **JSON Fields**: `specialties`, `goals`, `body_parts`, `exercises` 등은 JSON.parse/stringify 사용
- **Date Fields**: ISO 8601 문자열 형태로 저장 및 조회

### **🏗️ File Structure Rules**

#### **API Routes Pattern**
- **Location**: `src/app/api/[role]/[feature]/route.ts`
- **Naming**: kebab-case 사용 (예: `member-requests`, `trainer-search`)
- **Methods**: GET, POST, PUT, DELETE 중 필요한 것만 export

#### **Components Organization**
- **Role-based**: `src/components/[role]/` (member, trainer, shared)
- **Feature-based**: `src/components/[feature]/` (dashboard, schedule, notifications)
- **Import Path**: `@/components/...` 절대 경로 사용

#### **Types Location**
- **Database Types**: `src/lib/db.ts` (DB 스키마와 1:1 매칭)
- **Business Types**: `src/types/[domain].ts` (user.ts, workout.ts 등)
- **UI Types**: 컴포넌트 파일 내부에서 정의

### **🔐 Authentication & Authorization**

#### **Clerk Integration Rules**
- **User Identification**: `clerk_id` 필드로 사용자 매칭 (이메일은 보조 수단)
- **Role-based Access**: 모든 API에서 사용자 역할 확인 필수
- **Middleware**: `src/middleware.ts`에서 라우트 보호 설정

```typescript
// ✅ CORRECT Auth Pattern
import { auth } from '@clerk/nextjs/server'
const { userId } = await auth()
if (!userId) return new Response('Unauthorized', { status: 401 })

const user = await dbManager.first<User>('SELECT * FROM users WHERE clerk_id = ?', [userId])
if (user?.role !== 'trainer') return new Response('Forbidden', { status: 403 })
```

### **🚨 Error Handling & Logging**

#### **Logging Requirements**
- **Location**: 모든 로그는 `C:\Users\USER\Documents\MCPData\FitnessWEBAPP\logs` 폴더에 저장
- **Logger**: `src/lib/logger.ts` 사용
- **Log Levels**: ERROR, WARN, INFO, DEBUG 구분하여 사용

```typescript
// ✅ CORRECT Logging Pattern
import { logger } from '@/lib/logger'
try {
  // database operation
} catch (error) {
  logger.error('Database operation failed', { error, context: 'user-creation' })
  return new Response('Internal Server Error', { status: 500 })
}
```

#### **Error Response Pattern**
- **Client Errors (4xx)**: 사용자 입력 오류, 권한 부족
- **Server Errors (5xx)**: 데이터베이스 오류, 시스템 오류
- **Error Messages**: 사용자에게는 안전한 메시지, 로그에는 상세 정보

### **🔄 Git Workflow**

#### **Branch Strategy**
- **Development**: `test` 브랜치에서 모든 개발 진행
- **Testing**: `test` 브랜치에서 충분한 검증 후 PR 생성
- **Production**: `master` 브랜치로 머지 (PR을 통해서만)

#### **Commit Rules**
- **File Operations**: 파일 생성/수정 후 반드시 `git add` + `git commit`
- **Commit Messages**: `feat:`, `fix:`, `test:`, `refactor:` 등 prefix 사용
- **Deletion**: `git rm` 사용 후 커밋

### **🎯 Development Priorities**

#### **Primary Focus**
1. **Database Integration**: Mock 데이터 제거 완료, 실제 DB 연동만 진행
2. **API Reliability**: 모든 API 엔드포인트 안정성 확보
3. **Type Safety**: TypeScript 타입 안전성 100% 유지
4. **Error Recovery**: 견고한 에러 핸들링 및 로깅 시스템

#### **Testing Strategy**
- **Integration Tests**: 전체 플로우 검증 (가입 → 매칭 → 스케줄링)
- **API Tests**: 각 엔드포인트별 기능 검증
- **Error Scenario**: 데이터베이스 연결 실패, 권한 오류 등 예외 상황 테스트

### **📋 Task Execution Rules**

#### **Pre-Development Checks**
- [ ] 관련 파일들의 현재 구조 확인
- [ ] 타입 정의 확인 (`src/types/`, `src/lib/db.ts`)
- [ ] 기존 API 패턴 확인 (`src/app/api/`)
- [ ] 데이터베이스 스키마 확인 (`database/schema.sql`)

#### **Implementation Order**
1. **Type Definitions**: 필요한 타입 정의/수정
2. **Database Queries**: 데이터베이스 연산 구현
3. **API Routes**: RESTful API 엔드포인트 구현
4. **Frontend Components**: UI 컴포넌트 연동
5. **Error Handling**: 에러 케이스 처리
6. **Testing**: 전체 플로우 검증

#### **Quality Assurance**
- **Type Check**: `npm run build`로 TypeScript 오류 확인
- **Database Test**: 실제 데이터베이스 연결 및 쿼리 테스트
- **Integration Test**: 전체 사용자 플로우 검증
- **Log Verification**: 에러 로그가 올바른 위치에 저장되는지 확인

### **🎨 UI/UX Guidelines**

#### **Component Reusability**
- **Shared Components**: `src/components/shared/` 우선 활용
- **Role-specific**: 트레이너/회원 전용 컴포넌트는 각각의 폴더에 분리
- **UI Library**: 기존 `src/components/ui/` 컴포넌트 재사용

#### **Responsive Design**
- **Mobile First**: 모바일 환경 우선 고려
- **Tailwind CSS**: 일관된 스타일링 시스템 사용
- **Accessibility**: `src/components/shared/AccessibleNavigation.tsx` 패턴 준수

### **⚡ Performance Optimization**

#### **Database Optimization**
- **Indexing**: 자주 조회되는 컬럼에 인덱스 활용
- **Query Optimization**: JOIN 쿼리보다 개별 쿼리 우선 고려
- **Caching**: Cloudflare Workers의 캐싱 메커니즘 활용

#### **Frontend Optimization**
- **Image Optimization**: `src/components/shared/OptimizedImage.tsx` 사용
- **Performance Monitoring**: `src/components/shared/PerformanceMonitor.tsx` 활용
- **Skeleton UI**: 로딩 상태에 `src/components/shared/SkeletonUI.tsx` 사용

## Decision Trees

### **When Adding New Feature**
1. Does it require database changes? → Update `database/schema.sql` first
2. Does it need new types? → Add to `src/types/[domain].ts`
3. Is it role-specific? → Create in appropriate role folder
4. Does it affect multiple users? → Implement notification system

### **When Handling Errors**
1. Is it a user input error? → Return 4xx with user-friendly message
2. Is it a database error? → Log details, return 500 with generic message
3. Is it an authentication error? → Return 401/403 with redirect
4. Is it a system error? → Log to files, return 500

### **When Modifying Database**
1. Update schema in `database/schema.sql`
2. Update TypeScript types in `src/lib/db.ts`
3. Update related API routes
4. Update frontend components
5. Test integration flow

## Common Anti-Patterns to Avoid

### **❌ Wrong Patterns**
```typescript
// Mock data usage
const mockData = { id: '1', name: 'Test User' }

// Direct localStorage access  
localStorage.setItem('userData', JSON.stringify(data))

// Unsafe SQL queries
const query = `SELECT * FROM users WHERE id = ${userId}`

// Missing error handling
const result = await dbManager.query('SELECT * FROM users')
// No try-catch block

// Wrong import paths
import { User } from './types/user'  // Should use @/types/user
```

### **✅ Correct Patterns**
```typescript
// Database-first approach
const user = await dbManager.first<User>('SELECT * FROM users WHERE clerk_id = ?', [clerkId])

// Proper error handling
try {
  const result = await dbManager.execute('INSERT INTO users ...', params)
  logger.info('User created successfully', { userId: result.meta?.last_row_id })
} catch (error) {
  logger.error('User creation failed', { error, clerkId })
  return new Response('Failed to create user', { status: 500 })
}

// Correct import paths
import { User } from '@/types/user'
import { createDatabaseManager } from '@/lib/db'
```

---

**Last Updated**: Database-first implementation phase  
**Focus**: Real database integration, Mock data removal complete