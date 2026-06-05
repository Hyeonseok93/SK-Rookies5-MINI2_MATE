-- [1] 유저 생성 (ID 1, 2, 3)
INSERT INTO users (user_id, email, password, nickname, position, phone_number, created_at, updated_at) VALUES
(1, 'userbaek@mate.com', '$2a$10$dummy', '백승호', 'BE', '01011111111', NOW(), NOW()),
(2, 'user1@mate.com', '$2a$10$dummy', '개발왕', 'FE', '01022222222', NOW(), NOW()),
(3, 'user2@mate.com', '$2a$10$dummy', '스프링러너', 'BE', '01033333333', NOW(), NOW());

-- [2] 유저별 기술 스택 연계 (UserTechStack 테이블 - 얘는 BaseEntity 상속 안 해서 그대로 둠)
INSERT INTO user_tech_stacks (user_id, tech_stack) VALUES
(1, 'Spring Boot'), (1, 'Java'), (1, 'MySQL'),
(2, 'React'), (2, 'TypeScript'), (2, 'Next.js'),
(3, 'Spring Boot'), (3, 'Kotlin'), (3, 'JPA');

-- [3] 프로젝트 생성
INSERT INTO projects (project_id, owner_id, category, title, content, recruit_count, current_count, on_offline, status, end_date, created_at, updated_at) VALUES
(1, 1, 'PROJECT', 'Spring Cloud 기반 마이크로서비스', 'MSA 구축하실 분', 5, 1, 'ONLINE', 'RECRUITING', '2026-12-31', NOW(), NOW()),
(2, 2, 'STUDY', 'React 디자인 패턴 스터디', '고급 패턴 같이 공부해요', 4, 1, 'BOTH', 'RECRUITING', '2026-06-15', NOW(), NOW());

-- [4] 활동 이력 연계 (참여 및 신청)
-- applications 테이블 (updated_at 추가)
INSERT INTO applications (project_id, applicant_id, message, status, applied_at, created_at, updated_at)
VALUES (1, 2, '프론트엔드 작업 도와드리고 싶습니다!', 'ACCEPTED', NOW(), NOW(), NOW()),
       (2, 3, '백엔드 개발자인데 리액트 기초부터 배우고 싶어요.', 'PENDING', NOW(), NOW(), NOW()),
       (2, 1, '참여 희망합니다.', 'REJECTED', NOW(), NOW(), NOW());

-- project_members 테이블 (updated_at 추가)
INSERT INTO project_members (project_id, user_id, role, joined_at, created_at, updated_at)
VALUES (1, 2, 'MEMBER', NOW(), NOW(), NOW());

-- 관리자 계정 생성 (updated_at이 NULL이었던 부분을 NOW()로 수정)
--INSERT INTO users (
--    created_at,
--    updated_at,
--    deleted_at,
--    nickname,
--    phone_number,
--    email,
--    password,
--    profile_img,
--    position,
--    role
--) VALUES (
--    NOW(),
--    NOW(),
--    NULL,
--    '관리자',
--    '01099999999',
--    'admin@mate.com',
--    '$2a$10$aBb/e9umQqst4mwOfyF14u.RXqesvKXPQHjJ763He8g52Ojk25EVS',
--    NULL,
--    'BE',
--    'ROLE_ADMIN'
--);