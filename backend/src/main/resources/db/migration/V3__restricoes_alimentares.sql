CREATE TABLE restricoes_alimentares (
    `id` varchar(255) PRIMARY KEY NOT NULL,
    `id_usuario` char(11) NOT NULL,
    `id_restricao` varchar(255) NOT NULL,

    CONSTRAINT chave_estrangeira_restricoes_alimentares_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(CPF),
    CONSTRAINT chave_estrangeira_restricoes_alimentares_restricoes FOREIGN KEY (id_restricao) REFERENCES restricoes(id)
);
