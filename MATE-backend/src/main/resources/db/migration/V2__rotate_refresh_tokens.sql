-- Existing refresh tokens cannot be converted safely because only their raw
-- value was stored. Invalidate them once and start hash-based token families.
DELETE FROM refresh_tokens;

ALTER TABLE refresh_tokens DROP INDEX IF EXISTS uk_refresh_tokens_user;
ALTER TABLE refresh_tokens DROP INDEX IF EXISTS UK7tdcd6ab5wsgoudnvj7xf1b7l;

ALTER TABLE refresh_tokens
    ADD COLUMN IF NOT EXISTS family_id VARCHAR(36) NULL,
    ADD COLUMN IF NOT EXISTS token_hash VARCHAR(64) NULL,
    ADD COLUMN IF NOT EXISTS expires_at DATETIME(6) NULL,
    ADD COLUMN IF NOT EXISTS revoked_at DATETIME(6) NULL,
    ADD COLUMN IF NOT EXISTS replaced_by_hash VARCHAR(64) NULL;

ALTER TABLE refresh_tokens
    MODIFY family_id VARCHAR(36) NOT NULL,
    MODIFY token_hash VARCHAR(64) NOT NULL,
    MODIFY expires_at DATETIME(6) NOT NULL;

ALTER TABLE refresh_tokens DROP COLUMN IF EXISTS token_value;
CREATE UNIQUE INDEX IF NOT EXISTS uk_refresh_tokens_hash ON refresh_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_active ON refresh_tokens (user_id, revoked_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family_active ON refresh_tokens (family_id, revoked_at);
