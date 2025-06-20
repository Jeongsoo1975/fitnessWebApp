# 📄 웹 기반 개인 PT 피트니스 앱: 제품 요구사항 문서 (PRD)

**버전:** 1.0
**작성일:** 2025-06-08

---

## 1. 개요 (Overview)

### 1.1 목적
본 프로젝트는 **트레이너(PT)**와 회원 간의 퍼스널 트레이닝 관리를 위한 웹 기반 앱을 구축하는 것이 목표입니다. 기존 오프라인·종이 기반의 PT 일정, 식단, 진도 관리의 비효율을 해소하고, 디지털 기반의 통합 관리 도구를 제공합니다.

### 1.2 목표 사용자
-   **트레이너:** PT 스케줄 관리, 회원 관리, PT 세션 관리, 진행 현황 추적
-   **회원:** 개인 운동 스케줄 확인, 식단 기록, 운동 기록, 진행 현황 확인

### 1.3 주요 가치
-   **트레이너 생산성 향상:** 회원 관리 자동화
-   **회원 경험 강화:** 체계적 목표 설정과 진행 추적
-   **신뢰도 향상:** PT 세션 서명 인증 기능 제공

---

## 2. 핵심 기능 (Core Features)

### 2.1 운동 일정 관리 (Workout Schedule Management)
-   **기능 설명**
    -   캘린더 기반 운동 스케줄 관리
    -   운동 부위(등, 가슴 등) 기반 운동 내용 입력 가능
    -   운동 알림 제공 (세션 시작 전 알림)
-   **사용자 흐름**
    1.  트레이너가 회원 캘린더에 운동 일정 등록
    2.  회원은 캘린더 확인 및 운동 준비
    3.  세션 시작 시 알림 발송
-   **UI 요소**
    -   월간/주간 캘린더 뷰
    -   운동 상세 등록/수정 화면
    -   알림 설정 기능

### 2.2 식단 관리 (Diet Management)
-   **기능 설명**
    -   식단 텍스트 입력 및 사진 업로드
    -   AI 이미지 인식 기반 음식 자동 분석 (선택 기능)
    -   매크로(Nutrition: 탄수화물, 단백질, 지방) 추적
    -   식사 추천 기능
-   **사용자 흐름**
    1.  회원이 식사 기록 업로드(텍스트/사진)
    2.  앱이 AI 분석 후 매크로 자동 기록
    3.  트레이너는 회원 식단 확인 및 피드백 제공
-   **UI 요소**
    -   일일 식단 기록 화면
    -   사진 업로드 인터페이스
    -   매크로 진행 그래프
    -   식사 추천 팝업

### 2.3 트레이너-회원 관계 관리 (Trainer–Member Relationship Management)
-   **기능 설명**
    -   트레이너 계정과 회원 계정 분리
    -   트레이너-회원 매칭 기능 (초대 코드 / 검색 기반)
    -   회원 목록 관리 (트레이너 전용)
-   **사용자 흐름**
    1.  회원이 가입 시 트레이너 코드 입력 또는 트레이너 검색 후 요청
    2.  트레이너가 요청 승인
    3.  트레이너는 매칭된 회원 관리
-   **UI 요소**
    -   회원가입 시 트레이너 코드 입력 필드
    -   트레이너용 회원 관리 대시보드

### 2.4 PT 세션 관리 (PT Session Management)
-   **기능 설명**
    -   회원별 PT 세션 횟수 입력/관리
    -   PT 세션 종료 후 회원이 서명 입력
    -   자동으로 PT 세션 횟수 차감
-   **사용자 흐름**
    1.  트레이너가 회원 PT 잔여 횟수 설정
    2.  세션 종료 시 회원이 스마트폰에서 서명
    3.  횟수 자동 차감 및 기록 저장
-   **UI 요소**
    -   회원 프로필 내 PT 세션 현황 표시
    -   세션 종료 시 서명 입력 팝업
    -   세션 기록 상세 페이지

### 2.5 진행 현황 추적 (Progress Tracking)
-   **기능 설명**
    -   체중/신체 사이즈 기록
    -   운동 수행 기록 (중량/횟수 등)
    -   진척도 그래프 제공
    -   트레이너용 진행 리포트 제공
-   **사용자 흐름**
    1.  회원이 주기적 기록 입력
    2.  앱이 그래프 및 통계 제공
    3.  트레이너가 회원 진행 상황 분석
-   **UI 요소**
    -   “나의 기록” 대시보드
    -   체중 변화/신체 사이즈 변화 그래프
    -   운동 향상도 차트
    -   리포트 PDF 출력 기능 (트레이너용)

### 2.6 계정 및 로그인 (Accounts and Authentication)
-   **기능 설명**
    -   이메일/비밀번호 기반 회원가입/로그인
    -   소셜 로그인, 전화번호 로그인 지원 (Clerk 활용)
    -   역할 선택 (트레이너/회원)
    -   이메일 인증, 비밀번호 초기화 기능
-   **사용자 흐름**
    1.  사용자가 회원가입 시 Clerk 기반 UI 사용
    2.  가입 시 역할 선택
    3.  로그인 시 역할에 맞는 화면 제공
-   **UI 요소**
    -   Clerk 기본 제공 로그인/가입 컴포넌트
    -   역할 선택 UI
    -   비밀번호 초기화 UI

---

## 3. 기술 스택 및 인프라 구성 (Technology Stack & Infrastructure)

### 3.1 인증
-   **Clerk**
    -   빠른 인증 기능 통합
    -   지원 기능: 이메일/비밀번호, 사용자 이름, 전화번호, 다양한 소셜 로그인
    -   사전 제작된 컴포넌트 활용하여 UX 통일성 확보

### 3.2 데이터베이스
-   **Cloudflare D1**
    -   서버리스 DB (SQLite 기반)
    -   Cloudflare Workers와 함께 최적 활용
    -   무료 플랜 활용 가능 → 초기 서비스 운영 비용 절감

### 3.3 백엔드
-   **Cloudflare Workers**
    -   TypeScript 기반 개발 가능
    -   Next.js, Remix, Hono 등 프레임워크와 연동 가능
    -   높은 가성비 제공 (무료 10만 요청/일, 무제한 정적 자산 대역폭)

### 3.4 프론트엔드
-   React 기반 SPA 구성 (Next.js + Clerk + Cloudflare Workers API 호출)
-   반응형 디자인 적용 (PC/모바일 지원)

### 3.5 기타 고려사항
-   **데이터 보안:** HTTPS 통신, 개인정보 암호화 저장
-   **GDPR 대응:** 최소 정보 수집 및 명확한 활용 목적 고지
-   **확장성:** 트래픽 증가 대비 Cloudflare 기반 구조 확장 용이

---

## 4. 기능 우선순위 (Priority Roadmap)

| 기능 | MVP | V2 이후 개선 |
| :--- | :--- | :--- |
| 계정 및 로그인 | ✅ | 고급 2FA 추가 고려 |
| 트레이너-회원 매칭 | ✅ | 멀티 트레이너 지원 |
| 운동 일정 관리 | ✅ | 그룹 운동 기능 추가 고려 |
| PT 세션 관리 | ✅ | QR 코드 기반 출석 체크 추가 고려 |
| 식단 관리 | ✅ | AI 인식 정확도 고도화 |
| 진행 현황 추적 | ✅ (체중/사이즈 기본) | 운동 향상도 상세 분석 고도화 |

---

## 5. 프로젝트 일정 (High-level Timeline)

| 단계 | 기간 |
| :--- | :--- |
| 기획 확정 | 1주 |
| UI/UX 디자인 | 2주 |
| MVP 개발 (기능 구현) | 4~6주 |
| 내부 테스트 / 수정 | 2주 |
| 베타 오픈 | 1주 |
| 공식 런칭 | +1주 |

---

## 6. 예상 기대 효과
-   트레이너 업무 생산성 50% 향상 (회원 관리 자동화)
-   회원 평균 유지율 증가 (진행 현황 가시화 + 세션 인증 기능)
-   PT 서비스 품질 향상 → 회원 신뢰도 증대

---

## 7. 향후 확장 아이디어 (Optional Ideas)
-   실시간 채팅 기능 (트레이너 ↔ 회원)
-   그룹 클래스 스케줄 관리
-   헬스장 시설 예약 기능 추가
-   챌린지 기능(배지 제공, 커뮤니티 기능)