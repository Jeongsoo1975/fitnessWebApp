# FitnessWebApp 모바일 스타일 시스템 사용법

## 설치 및 설정

모바일 스타일 시스템이 이미 프로젝트에 설정되어 있습니다. 추가 설정 없이 바로 사용할 수 있습니다.

## 빠른 시작

### 1. 기본 모바일 컴포넌트 사용

```tsx
import React from 'react'

const ExampleComponent = () => {
  return (
    <div className="mobile-container">
      <h1 className="mobile-heading">안녕하세요!</h1>
      
      <div className="mobile-card">
        <h2 className="mobile-subheading">카드 제목</h2>
        <p className="mobile-body">카드 내용입니다.</p>
        
        <button className="mobile-button bg-blue-600 text-white">
          액션 버튼
        </button>
      </div>
    </div>
  )
}
```

### 2. 터치 최적화 폼

```tsx
const MobileForm = () => {
  return (
    <form className="mobile-container mobile-spacing">
      <div className="mobile-form-group">
        <label className="mobile-form-label">이메일</label>
        <input 
          type="email" 
          className="mobile-input"
          placeholder="이메일을 입력하세요"
        />
      </div>
      
      <button 
        type="submit"
        className="mobile-button-large w-full bg-green-600 text-white"
      >
        제출하기
      </button>
    </form>
  )
}
```

### 3. 반응형 그리드

```tsx
const MobileGrid = () => {
  return (
    <div className="mobile-container">
      <div className="mobile-grid">
        <div className="mobile-card">항목 1</div>
        <div className="mobile-card">항목 2</div>
        <div className="mobile-card">항목 3</div>
        <div className="mobile-card">항목 4</div>
      </div>
    </div>
  )
}
```

## 주요 클래스 참조

### 컨테이너
- `mobile-container`: 반응형 컨테이너 (최대 너비 제한)
- `mobile-container-full`: 전체 너비 컨테이너

### 버튼
- `mobile-button`: 기본 모바일 버튼 (48px 높이)
- `mobile-button-small`: 작은 버튼 (40px 높이)
- `mobile-button-large`: 큰 버튼 (56px 높이)

### 카드
- `mobile-card`: 기본 카드 (패딩, 테두리, 그림자 포함)
- `mobile-card-compact`: 컴팩트 카드 (작은 패딩)

### 입력 필드
- `mobile-input`: 터치 최적화 입력 필드 (48px 높이)

### 터치 타겟
- `touch-target`: 최소 44px × 44px 터치 영역
- `touch-target-large`: 48px × 48px 터치 영역

### 스페이싱
- `mobile-padding`: 반응형 패딩 (모바일: 16px, 데스크톱: 24px)
- `mobile-spacing`: 반응형 수직 간격
- `mobile-spacing-compact`: 컴팩트 수직 간격

### 타이포그래피
- `mobile-heading`: 주요 제목 (반응형 크기)
- `mobile-subheading`: 부제목
- `mobile-body`: 본문 텍스트
- `mobile-caption`: 캡션/작은 텍스트

### 그리드
- `mobile-grid`: 1→2→3→4 컬럼 반응형 그리드
- `mobile-grid-auto`: 자동 반응형 그리드

### 네비게이션
- `mobile-nav-item`: 하단 네비게이션 아이템
- `mobile-nav-icon`: 네비게이션 아이콘
- `mobile-nav-label`: 네비게이션 라벨

### 폼 요소
- `mobile-form-group`: 폼 그룹 컨테이너
- `mobile-form-label`: 폼 라벨
- `mobile-form-error`: 에러 메시지

### 로딩 상태
- `mobile-loading`: 펄스 로딩 애니메이션
- `mobile-skeleton`: 스켈레톤 로딩

### Safe Area
- `safe-area-top`: 상단 Safe Area 패딩
- `safe-area-bottom`: 하단 Safe Area 패딩
- `safe-area-inset`: 전체 Safe Area 패딩

## 유틸리티 함수 사용법

```tsx
import { 
  cn, 
  getMobileButtonClasses, 
  getTouchTargetClasses,
  isMobileDevice,
  getCurrentBreakpoint 
} from '@/styles/mobile-utils'

const MyComponent = () => {
  const isMobile = isMobileDevice()
  const breakpoint = getCurrentBreakpoint()
  
  return (
    <button 
      className={cn(
        getMobileButtonClasses('large', 'primary'),
        getTouchTargetClasses('large'),
        'w-full'
      )}
    >
      버튼
    </button>
  )
}
```

## TypeScript 지원

```tsx
import type { 
  MobileButtonProps, 
  MobileCardProps, 
  TouchTargetSize 
} from '@/styles/mobile-types'

const CustomButton: React.FC<MobileButtonProps> = ({
  size = 'default',
  variant = 'primary',
  children,
  ...props
}) => {
  return (
    <button 
      className={getMobileButtonClasses(size, variant)}
      {...props}
    >
      {children}
    </button>
  )
}
```

## 성능 최적화

### 1. 터치 최적화
```tsx
// touch-manipulation 자동 적용
<button className="mobile-button">버튼</button>

// 수동 터치 액션 설정
<div className="touch-pan-y">세로 스크롤만 허용</div>
```

### 2. 탭 하이라이트 제거
```tsx
// 자동으로 적용됨
<button className="mobile-button tap-highlight-none">
  하이라이트 없는 버튼
</button>
```

### 3. 애니메이션 최적화
```tsx
// 터치 피드백
<button className="mobile-button animate-touch-feedback">
  터치 시 스케일 효과
</button>

// 페이지 전환
<div className="animate-slide-up">
  부드러운 슬라이드 업
</div>
```

## 접근성 지원

### 1. 충분한 터치 타겟 크기
```tsx
// 최소 44px × 44px 보장
<button className="touch-target">접근 가능한 버튼</button>
```

### 2. 적절한 색상 대비
```tsx
// WCAG 2.1 AA 기준 준수
<button className="mobile-button bg-blue-600 text-white">
  고대비 버튼
</button>
```

### 3. 포커스 관리
```tsx
// 키보드 네비게이션 지원
<button className="mobile-button focus:ring-2 focus:ring-blue-500">
  포커스 가능한 버튼
</button>
```

## 모범 사례

### ✅ 좋은 예
```tsx
const GoodExample = () => (
  <div className="mobile-container">
    <h1 className="mobile-heading">제목</h1>
    <div className="mobile-spacing">
      <div className="mobile-card">
        <h2 className="mobile-subheading">카드 제목</h2>
        <p className="mobile-body">내용</p>
        <button className="mobile-button-large bg-blue-600 text-white">
          주요 액션
        </button>
      </div>
    </div>
  </div>
)
```

### ❌ 피해야 할 예
```tsx
const BadExample = () => (
  <div className="p-1 max-w-xs">
    <h1 className="text-sm">작은 제목</h1>
    <div className="space-y-1">
      <button className="py-1 px-2 text-xs">작은 버튼</button>
    </div>
  </div>
)
```

## 디버깅 및 검증

### 1. 개발자 도구에서 확인
- Chrome DevTools의 모바일 시뮬레이터 사용
- 터치 타겟 크기 검증
- 성능 프로파일링

### 2. 실제 디바이스 테스트
- 다양한 화면 크기에서 테스트
- 터치 반응성 확인
- 네트워크 속도별 로딩 테스트

더 자세한 정보는 `/src/styles/mobile-guidelines.md` 파일을 참조하세요.
