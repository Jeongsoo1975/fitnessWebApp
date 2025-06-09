# FitnessWebApp 모바일 디자인 시스템

이 문서는 FitnessWebApp의 일관된 모바일 최적화를 위한 디자인 시스템과 가이드라인을 제공합니다.

## 핵심 원칙

### 1. Mobile-First 디자인
- 모든 컴포넌트는 모바일을 우선으로 설계
- 점진적 향상(Progressive Enhancement) 방식 채택
- 터치 인터페이스 최적화

### 2. 접근성 기준 준수
- 최소 터치 타겟: 44px × 44px (Apple 가이드라인)
- 권장 터치 타겟: 48px × 48px (Google Material Design)
- 색상 대비: WCAG 2.1 AA 기준 준수

## 스타일 클래스 사용법

### 터치 타겟
```tsx
// 기본 터치 타겟 (44px 최소)
<button className="touch-target">버튼</button>

// 대형 터치 타겟 (48px 최소)
<button className="touch-target-large">중요한 버튼</button>
```

### 버튼 시스템
```tsx
// 기본 모바일 버튼
<button className="mobile-button bg-blue-600 text-white">
  확인
</button>

// 작은 버튼
<button className="mobile-button-small bg-gray-200 text-gray-800">
  취소
</button>

// 큰 버튼 (주요 액션)
<button className="mobile-button-large bg-green-600 text-white">
  시작하기
</button>
```

### 카드 컴포넌트
```tsx
// 기본 모바일 카드
<div className="mobile-card">
  <h3 className="mobile-subheading">제목</h3>
  <p className="mobile-body">내용</p>
</div>

// 컴팩트 카드
<div className="mobile-card-compact">
  간단한 내용
</div>
```

### 입력 필드
```tsx
// 모바일 최적화 입력 필드
<input 
  type="text" 
  className="mobile-input" 
  placeholder="입력하세요"
/>
```

### 컨테이너 시스템
```tsx
// 반응형 컨테이너
<div className="mobile-container">
  <h1 className="mobile-heading">제목</h1>
  <div className="mobile-spacing">
    <p className="mobile-body">내용</p>
  </div>
</div>
```

### 그리드 레이아웃
```tsx
// 자동 반응형 그리드
<div className="mobile-grid">
  <div className="mobile-card">카드 1</div>
  <div className="mobile-card">카드 2</div>
  <div className="mobile-card">카드 3</div>
</div>
```

### 네비게이션
```tsx
// 모바일 네비게이션 아이템
<button className="mobile-nav-item">
  <Icon className="mobile-nav-icon" />
  <span className="mobile-nav-label">홈</span>
</button>
```

### 타이포그래피
```tsx
<h1 className="mobile-heading">주요 제목</h1>
<h2 className="mobile-subheading">부제목</h2>
<p className="mobile-body">본문 텍스트</p>
<span className="mobile-caption">캡션</span>
```

## 반응형 중단점

```css
/* 모바일 우선 중단점 */
xs: 475px   /* 큰 모바일 */
sm: 640px   /* 작은 태블릿 */
md: 768px   /* 태블릿 */
lg: 1024px  /* 작은 데스크톱 */
xl: 1280px  /* 데스크톱 */
2xl: 1536px /* 큰 데스크톱 */
```

## 유틸리티 클래스

### 터치 관련
- `touch-manipulation`: 터치 최적화
- `touch-pan-x`: 가로 스크롤만 허용
- `touch-pan-y`: 세로 스크롤만 허용
- `touch-none`: 터치 비활성화
- `tap-highlight-none`: 탭 하이라이트 제거

### Safe Area 지원
```tsx
// iPhone X 이후 기기의 노치 대응
<div className="safe-area-top">상단 컨텐츠</div>
<div className="safe-area-bottom">하단 컨텐츠</div>
<div className="safe-area-inset">전체 컨텐츠</div>
```

### 로딩 상태
```tsx
// 스켈레톤 로딩
<div className="mobile-skeleton h-4 w-20"></div>

// 펄스 로딩
<div className="mobile-loading h-8 w-full"></div>
```

## 애니메이션

### 터치 피드백
```tsx
<button className="mobile-button animate-touch-feedback">
  터치 피드백 버튼
</button>
```

### 페이지 전환
```tsx
<div className="animate-slide-up">
  아래에서 위로 슬라이드
</div>

<div className="animate-fade-in">
  페이드 인
</div>
```

## 모범 사례

### 1. 컴포넌트 개발
```tsx
// ✅ 좋은 예
const MyComponent = () => (
  <div className="mobile-container">
    <h2 className="mobile-subheading">제목</h2>
    <div className="mobile-spacing">
      <button className="mobile-button-large bg-blue-600 text-white">
        주요 액션
      </button>
      <button className="mobile-button bg-gray-200 text-gray-800">
        보조 액션
      </button>
    </div>
  </div>
)

// ❌ 나쁜 예
const MyComponent = () => (
  <div className="p-2">
    <h2 className="text-lg">제목</h2>
    <button className="py-1 px-2 text-sm">작은 버튼</button>
  </div>
)
```

### 2. 폼 디자인
```tsx
// ✅ 모바일 친화적 폼
<form className="mobile-container mobile-spacing">
  <div className="mobile-form-group">
    <label className="mobile-form-label">
      이메일
    </label>
    <input 
      type="email" 
      className="mobile-input"
      placeholder="example@email.com"
    />
  </div>
  
  <button 
    type="submit" 
    className="mobile-button-large w-full bg-blue-600 text-white"
  >
    제출하기
  </button>
</form>
```

### 3. 리스트 디자인
```tsx
// ✅ 터치 친화적 리스트
<div className="space-y-2">
  {items.map(item => (
    <button 
      key={item.id}
      className="mobile-card w-full text-left touch-target-large"
    >
      <h3 className="mobile-subheading">{item.title}</h3>
      <p className="mobile-body text-gray-600">{item.description}</p>
    </button>
  ))}
</div>
```

## 테스트 가이드라인

### 1. 다양한 디바이스에서 테스트
- iPhone SE (375px)
- iPhone 12/13/14 (390px)
- Android 기본 (360px)
- iPad (768px)

### 2. 터치 타겟 검증
- 모든 인터랙티브 요소가 최소 44px × 44px
- 인접한 터치 타겟 간 최소 8px 간격

### 3. 성능 검증
- 모바일 네트워크에서 로딩 시간
- 터치 응답 시간 (100ms 이내)
- 스크롤 성능 (60fps 유지)

이 가이드라인을 따라 일관된 모바일 사용자 경험을 제공하세요.
