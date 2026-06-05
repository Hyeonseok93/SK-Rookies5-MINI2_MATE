# 🤝 MATE: 함께 만드는 프로젝트 메이트

**MATE**는 사이드 프로젝트 팀원 모집, 스터디 그룹 형성, 그리고 매칭을 돕는 웹 애플리케이션입니다. 개발자, 디자이너, 기획자가 한데 모여 최적의 팀을 구성하고 목표를 달성할 수 있도록 직관적인 플랫폼을 제공합니다.

---

## 🚀 프로젝트 개요 (Project Overview)

MATE는 복잡한 팀 구성 과정을 단순화하여 유저가 오직 프로젝트의 본질에 집중할 수 있도록 돕습니다.
- **모집 및 지원**: 누구나 새로운 프로젝트/스터디 모집글을 작성하고, 관심 있는 글에 지원할 수 있습니다.
- **팀 매칭**: 작성자는 지원자의 프로필을 확인하고 승인/거절을 통해 팀원을 확정합니다.
- **협업 관리**: 마이페이지를 통해 본인의 지원 현황과 모집 현황을 한눈에 관리할 수 있습니다.

---

## 🛠 기술 스택 (Tech Stack)

### Core
- **Framework**: React 19 (Vite 기반)
- **Routing**: React Router Dom v7
- **State Management**: Zustand (Auth, Post, UI 상태 관리)

### UI & Styling
- **UI Framework**: MUI (Material UI)
- **Styling**: Emotion (@emotion/react, @emotion/styled)
- **Icons**: MUI Icons

### Infrastructure & Dev Tools
- **HTTP Client**: Axios (Interceptor 기반 JWT 인증 처리)
- **API Mocking**: MSW (Mock Service Worker)를 통한 독립적 개발 환경 구축
- **Build Tool**: Vite

---

## 📂 디렉토리 구조 (Directory Structure)

```bash
src/
├── api/             # API 호출 함수 및 Axios 인스턴스 (Interceptor 포함)
├── assets/          # 이미지, SVG 등 정적 리소스
├── component/       # 재사용 가능한 UI 컴포넌트
│   ├── common/      # Button, PostCard, Avatar 등 공통 컴포넌트
│   └── layout/      # Header, Footer, MainLayout 등 레이아웃
├── constants/       # 기술 스택 목록 등 고정값 정의
├── mocks/           # MSW 핸들러 및 모의 데이터 (Mock Data)
├── pages/           # 주요 서비스 화면 (View)
├── store/           # Zustand 기반 상태 관리 스토어
├── styles/          # MUI Theme 및 전역 CSS 설정
└── utils/           # 날짜 포맷, 상태 변환 등 유틸리티 함수
```

---

## ✨ 주요 화면 및 기능 (Core Features)

1. **메인 페이지 (MainPage)**: 최신 프로젝트/스터디 모집글 목록을 탐색하고 카테고리별 필터링 및 검색 기능을 제공합니다.
2. **인증 (Login/Register)**: JWT 기반 로그인 및 회원가입을 지원하며, 비밀번호 찾기 등 편의 기능을 포함합니다.
3. **모집글 작성 및 관리 (Post CRUD)**: 프로젝트 상세 내용, 모집 인원, 기술 스택 등을 설정하여 글을 게시하고 수정할 수 있습니다.
4. **지원하기 및 매칭 (Apply & Match)**: 관심 있는 프로젝트에 지원 동기를 작성하여 신청할 수 있습니다.
5. **마이페이지 (MyPage)**: 
   - **프로필 관리**: 닉네임, 기술 스택 등 개인 정보 수정
   - **내 모집글**: 내가 올린 글의 지원자 목록 확인 및 수락/거절 관리
   - **내 지원현황**: 내가 지원한 프로젝트의 승인 여부 실시간 확인

---

## 🔗 API 연동 및 환경 변수

### API 호출 구조
- `src/api/axiosInstance.js`에서 공통 설정을 관리합니다.
- **인증 처리**: Request Interceptor를 통해 `Authorization` 헤더에 Bearer 토큰을 자동으로 주입합니다.
- **토큰 갱신**: Response Interceptor에서 401 에러 감지 시 Refresh Token을 사용해 자동으로 Access Token을 재발급받습니다.

### 환경 변수 설정
루트 디렉토리에 `.env` 파일을 생성하고 다음 설정을 추가하세요.
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## ⚙️ 설치 및 실행 방법 (Getting Started)

### 1. 의존성 설치
```bash
cd Frontend-Mate
npm install
```

### 2. 로컬 개발 서버 실행
```bash
npm run dev
```
- 실행 후 브라우저에서 `http://localhost:5173`으로 접속합니다.

### 3. 빌드 및 배포
```bash
npm run build
```
- `dist` 폴더에 정적 빌드 파일이 생성됩니다.
