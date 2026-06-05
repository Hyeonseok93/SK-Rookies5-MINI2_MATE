# Backend-MATE 👥

**Backend-MATE**는 팀 프로젝트 및 스터디원 모집을 위한 협업 플랫폼의 백엔드 애플리케이션입니다. 사용자들은 자신의 기술 스택과 포지션을 설정하여 팀원을 찾거나, 원하는 프로젝트에 지원하여 함께 협업할 수 있습니다.

---

## 1. 프로젝트 개요
- **목적**: 효율적인 팀 매칭과 스터디 모집 과정을 자동화하고 관리하기 위한 RESTful API 서버입니다.
- **핵심 가치**: 
  - 신속한 팀원 모집 및 지원 프로세스 제공
  - 기술 스택 및 포지션 기반의 사용자 프로필 관리
  - 프로젝트별 게시판 및 댓글을 통한 원활한 소통 지원
  - 관리자 대시보드를 통한 서비스 모니터링 및 데이터 관리

---

## 2. 기술 스택 (Tech Stack)

### Core
- **Language**: Java 17
- **Framework**: Spring Boot 3.5.x
- **Build Tool**: Maven

### Database & Persistence
- **Database**: MariaDB (Production/Dev), H2 (Test)
- **ORM**: Spring Data JPA (Hibernate)
- **Migration/Script**: Flyway (준비됨), JPA DDL-Auto, data.sql

### Security
- **Authentication**: Spring Security, JWT (JSON Web Token)
- **Encryption**: BCryptPasswordEncoder

### Infrastructure & Others
- **File Storage**: Cloudinary (프로필 이미지 업로드)
- **Monitoring**: Spring Boot Actuator, Spring Boot Admin
- **Library**: Lombok, Validation, Custom Mapper (Entity-DTO 매퍼 클래스)

---

## 3. 프로젝트 구조

```text
src/main/java/com/rookies5/Backend_MATE/
├── common/              # 공통 응답 처리 (SuccessResponse)
├── config/              # Security, Web, Cloudinary 등 설정 클래스
├── controller/          # REST API 컨트롤러
├── dto/                 # Request/Response Data Transfer Object
├── entity/              # JPA 엔티티 및 Enum (BaseEntity 상속)
├── exception/           # 전역 예외 처리 및 커스텀 에러 코드
├── mapper/              # Entity <-> DTO 변환 로직 (Mapper)
├── repository/          # Spring Data JPA 리포지토리
├── security/            # JWT 및 시큐리티 관련 유틸리티 (JwtTokenProvider 등)
└── service/             # 비즈니스 로직 인터페이스 및 구현체 (impl)
```

---

## 4. 핵심 도메인 및 ERD 개요

### 주요 엔티티 관계
- **User (회원)**: 닉네임, 기술 스택, 포지션 정보를 보유하며 여러 프로젝트를 소유하거나 참여할 수 있습니다.
- **Project (모집글)**: 카테고리, 모집 인원, 기술 스택을 정의하며 특정 `User`가 생성(Owner)합니다.
- **Application (지원서)**: `User`가 `Project`에 지원할 때 생성되며, 방장에 의해 승인/거절 상태가 결정됩니다. (1:N 관계)
- **ProjectMember (참여 멤버)**: 프로젝트에 최종 합류된 인원들을 관리합니다. (User-Project N:M 해소 엔티티)
- **BoardPost & Comment**: 각 프로젝트 내에서 소통을 위한 게시글과 댓글 기능을 제공합니다.

---

## 5. 주요 API 기능 요약

### 🔐 인증 및 회원 (Auth & User)
- `POST /api/auth/signup`: 회원가입
- `POST /api/auth/login`: 로그인 및 JWT 발급
- `GET /api/users/me`: 내 정보 조회 및 수정 (`PATCH /me`)
- `GET /api/users/me/posts/owned`: 내가 생성한 프로젝트 목록 조회

### 📋 프로젝트 모집 (Project)
- `POST /api/projects`: 모집글 생성
- `GET /api/projects`: 전체 목록 조회 (필터링: 카테고리, 키워드)
- `PATCH /api/projects/{id}/close`: 모집 수동 마감
- `PATCH /api/projects/{id}/reopen`: 프로젝트 재모집 시작

### ✉️ 지원 및 멤버 (Application & Member)
- `POST /api/applications/{projectId}`: 프로젝트 지원하기
- `PATCH /api/applications/{id}/status`: 지원서 상태 변경 (승인/거절)
- `GET /api/posts/{projectId}/members`: 프로젝트 참여 멤버 조회

### 💬 게시판 및 댓글 (Board & Comment)
- `GET /api/posts/{projectId}/board`: 프로젝트 내 게시글 목록
- `POST /api/posts/{projectId}/board/{postId}/comments`: 댓글 작성

### 🛠️ 관리자 (Admin)
- `GET /admin/dashboard`: 전체 서비스 현황 대시보드
- `POST /admin/users/restore/{id}`: 삭제된 회원 및 데이터 복구

---

## 6. 설치 및 실행 방법

### 환경 변수 설정
`src/main/resources/application-dev.properties` 파일을 확인하여 다음 설정을 환경에 맞게 수정합니다.

```properties
# MariaDB 설정
spring.datasource.url=jdbc:mariadb://localhost:3306/mate_db
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD

# JWT 설정
jwt.secret=your_very_long_random_secret_key_here

# Cloudinary 설정 (이미지 업로드 사용 시)
cloudinary.cloud-name=your_cloud_name
cloudinary.api-key=your_api_key
cloudinary.api-secret=your_api_secret
```

### 실행 단계
1. **Repository Clone**
   ```bash
   git clone https://github.com/your-repo/Backend-MATE.git
   cd Backend-MATE
   ```
2. **Database 생성**
   - MariaDB에 `mate_db` 데이터베이스를 생성합니다.
3. **Maven Build & Run**
   ```bash
   # Windows (cmd/powershell)
   mvnw.cmd spring-boot:run
   
   # Linux/macOS
   ./mvnw spring-boot:run
   ```
4. **API 접속**
   - 기본 포트: `http://localhost:8080`