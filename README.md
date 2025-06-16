# FitnessWebApp

웹 기반 개인 PT 피트니스 관리 앱

## 🏗️ 기술 스택

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: Clerk
- **Deployment**: Cloudflare Pages + Workers

## 📁 프로젝트 구조

```
FitnessWEBAPP/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React 컴포넌트
│   │   ├── trainer/         # 트레이너 전용 컴포넌트
│   │   ├── member/          # 회원 전용 컴포넌트
│   │   └── shared/          # 공통 컴포넌트
│   ├── lib/                 # 유틸리티 및 라이브러리
│   ├── types/               # TypeScript 타입 정의
│   └── hooks/               # 커스텀 React 훅
├── workers/api/             # Cloudflare Workers API
├── database/                # 데이터베이스 관련 파일
│   ├── schema.sql           # 데이터베이스 스키마
│   ├── migrations/          # 마이그레이션 파일
│   └── test_queries.sql     # 테스트 쿼리
└── 설정 파일들
```

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example`을 참고하여 `.env.local` 파일을 생성하고 필요한 값들을 설정하세요.

```bash
cp .env.example .env.local
```

### 3. Cloudflare D1 데이터베이스 설정

```bash
# D1 데이터베이스 생성
npx wrangler d1 create fitness-app-db

# 생성된 database_id를 wrangler.toml에 업데이트

# 스키마 적용
npx wrangler d1 execute fitness-app-db --file=./database/migrations/001_initial.sql
```

### 4. 개발 서버 실행

```bash
# Next.js 개발 서버
npm run dev

# Cloudflare Workers 개발 서버 (별도 터미널)
npx wrangler dev
```

## 🗄️ 데이터베이스 스키마

### 주요 테이블

- **users**: 사용자 정보 (트레이너/회원)
- **trainer_members**: 트레이너-회원 관계
- **pt_sessions**: PT 세션 관리
- **session_records**: 개별 세션 기록
- **workouts**: 운동 일정
- **diets**: 식단 기록
- **progress_tracking**: 진행 현황 추적
- **exercise_records**: 운동 수행 기록

### 스키마 테스트

로컬에서 데이터베이스 스키마를 테스트하려면:

```bash
# SQLite3 설치 (선택사항)
npm install sqlite3

# 로컬 테스트 실행
node database/test_local.js
```

## 🔧 개발 가이드

### 코딩 규칙

이 프로젝트는 `shrimp-rules.md`에 정의된 아키텍처 패턴을 따릅니다:

- 파일명: kebab-case (`workout-schedule.tsx`)
- 컴포넌트: PascalCase (`WorkoutSchedule`)
- 변수/함수: camelCase (`getUserWorkouts`)
- 환경 변수: UPPER_SNAKE_CASE (`DATABASE_URL`)

### React Hooks 의존성 관리

**v2025.6.16 업데이트**: React Hooks 의존성 최적화 완료

프로젝트에서 React Hooks 사용 시 다음 패턴을 준수하세요:

#### ✅ 올바른 패턴
```typescript
// useCallback에서 primitive 값 의존성 사용
const fetchData = useCallback(async () => {
  if (!user?.id || !role) return
  // API 호출 로직
}, [user?.id, role])

// useEffect에서 primitive 값 의존성 사용
useEffect(() => {
  // 조건부 검사 후 API 호출
  if (user?.id && role) {
    // 로직 실행
  }
}, [user?.id, role])
```

#### ❌ 피해야 할 패턴  
```typescript
// 객체 의존성으로 인한 무한 루프
useEffect(() => {
  fetchData()
}, [fetchData, user, getToken]) // 객체 참조로 인한 문제
```

주요 개선 사항:
- `ScheduleCalendar.tsx`: useCallback/useEffect 순환 의존성 해결
- `TrainerMemberManager.tsx`: getToken 의존성 최적화  
- 무한 리렌더링 방지 및 성능 개선
- ESLint 규칙 준수

상세한 내용은 `React_Hooks_Verification_Report.md` 참조

### 타입 안전성

- 모든 컴포넌트에 TypeScript 인터페이스 정의
- 데이터베이스 엔티티 타입 활용 (`src/types/`)
- Strict 모드 사용

## 📦 배포

### Cloudflare Pages 배포

```bash
# 빌드
npm run build

# Cloudflare Pages에 배포
npx wrangler pages deploy
```

### Workers 배포

```bash
# Workers 배포
npx wrangler deploy
```

## 🧪 테스트

```bash
# 타입 체크
npx tsc --noEmit

# 빌드 테스트
npm run build

# 데이터베이스 스키마 테스트
node database/test_local.js
```

## 📄 라이센스

MIT License