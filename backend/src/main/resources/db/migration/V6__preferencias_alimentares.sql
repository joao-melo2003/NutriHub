CREATE TABLE preferencias_alimentares (
    `id` varchar(255) PRIMARY KEY NOT NULL,
    `usuario_id` char(11) NOT NULL,
    `alimento_id` varchar(255) NOT NULL,
    `preferencia` ENUM ('GOSTO', 'NAO_GOSTO') NOT NULL,

    CONSTRAINT chave_estrangeira_preferencias_alimentares_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios(CPF),
    CONSTRAINT chave_estrangeira_preferencias_alimentares_alimentos FOREIGN KEY (alimento_id) REFERENCES alimentos(id)
);
