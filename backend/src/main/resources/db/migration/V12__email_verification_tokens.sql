CREATE TABLE user_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id CHAR(11) NOT NULL,
    tipo ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET') NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,

    CONSTRAINT fk_user_tokens_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (CPF) ON DELETE CASCADE
);

CREATE INDEX idx_user_tokens_usuario_tipo ON user_tokens (usuario_id, tipo);