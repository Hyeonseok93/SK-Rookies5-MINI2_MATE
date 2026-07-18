SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE users (
    user_id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    email VARCHAR(100) NOT NULL,
    nickname VARCHAR(10) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    position ENUM('BE','DE','ETC','FE','FS','PM') NOT NULL,
    profile_img VARCHAR(255) NULL,
    role ENUM('ROLE_ADMIN','ROLE_USER') NOT NULL,
    PRIMARY KEY (user_id),
    UNIQUE KEY uk_users_email (email),
    UNIQUE KEY uk_users_nickname (nickname),
    UNIQUE KEY uk_users_phone (phone_number),
    KEY idx_email (email),
    KEY idx_nickname (nickname),
    KEY idx_phone_number (phone_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE projects (
    project_id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    category ENUM('PROJECT','STUDY') NOT NULL,
    content TEXT NOT NULL,
    current_count INT NOT NULL,
    end_date DATE NOT NULL,
    on_offline ENUM('BOTH','OFFLINE','ONLINE') NOT NULL,
    recruit_count INT NOT NULL,
    status ENUM('CLOSED','DELETED','RECRUITING') NOT NULL,
    title VARCHAR(50) NOT NULL,
    owner_id BIGINT NOT NULL,
    PRIMARY KEY (project_id),
    KEY idx_status (status),
    CONSTRAINT fk_projects_owner FOREIGN KEY (owner_id) REFERENCES users (user_id),
    CONSTRAINT chk_projects_recruit_count CHECK (recruit_count BETWEEN 1 AND 20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE applications (
    application_id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    applied_at DATETIME(6) NOT NULL,
    contact VARCHAR(255) NULL,
    link VARCHAR(255) NULL,
    message VARCHAR(500) NOT NULL,
    position ENUM('BE','DE','ETC','FE','FS','PM') NOT NULL,
    status ENUM('ACCEPTED','PENDING','REJECTED') NOT NULL,
    applicant_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    PRIMARY KEY (application_id),
    CONSTRAINT fk_applications_user FOREIGN KEY (applicant_id) REFERENCES users (user_id),
    CONSTRAINT fk_applications_project FOREIGN KEY (project_id) REFERENCES projects (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE project_members (
    member_id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    joined_at DATETIME(6) NOT NULL,
    position ENUM('BE','DE','ETC','FE','FS','PM') NOT NULL,
    role ENUM('MEMBER','OWNER') NOT NULL,
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (member_id),
    UNIQUE KEY uk_project_member (project_id, user_id),
    CONSTRAINT fk_members_project FOREIGN KEY (project_id) REFERENCES projects (project_id),
    CONSTRAINT fk_members_user FOREIGN KEY (user_id) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE board_posts (
    post_id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    content TEXT NOT NULL,
    title VARCHAR(100) NOT NULL,
    type ENUM('GENERAL','NOTICE','QUESTION') NULL,
    view_count INT NOT NULL,
    author_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    PRIMARY KEY (post_id),
    CONSTRAINT fk_board_posts_author FOREIGN KEY (author_id) REFERENCES users (user_id),
    CONSTRAINT fk_board_posts_project FOREIGN KEY (project_id) REFERENCES projects (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE comments (
    comment_id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    content VARCHAR(500) NOT NULL,
    author_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    PRIMARY KEY (comment_id),
    CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES users (user_id),
    CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES board_posts (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE project_tech_stacks (
    project_id BIGINT NOT NULL,
    tech_stack_name VARCHAR(255) NULL,
    CONSTRAINT fk_project_tech_stacks_project FOREIGN KEY (project_id) REFERENCES projects (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_tech_stacks (
    user_id BIGINT NOT NULL,
    tech_stack VARCHAR(50) NULL,
    CONSTRAINT fk_user_tech_stacks_user FOREIGN KEY (user_id) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE refresh_tokens (
    id BIGINT NOT NULL AUTO_INCREMENT,
    token_value VARCHAR(512) NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_refresh_tokens_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admin_logs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    action VARCHAR(255) NULL,
    created_at DATETIME(6) NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
