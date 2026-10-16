CREATE TABLE rotinas (
    id VARCHAR(255) PRIMARY KEY NOT NULL,
    id_usuario CHAR(11) NOT NULL,
    objetivo ENUM('GANHO_MASSA', 'PERDA_PESO', 'MANUTENCAO') NOT NULL,
    peso NUMERIC(5, 2) NOT NULL,
    altura NUMERIC(4, 2) NOT NULL,
    divisao ENUM(
        'ABC',
        'FULL_BODY',
        'UPPER_LOWER',
        'PUSH_PULL_LEGS',
        'ABCDE'
    ) NOT NULL,
    distribuicao ENUM('PRIORIDADE', 'BALANCEADO') NOT NULL,

    CONSTRAINT chave_estrangeira_rotinas_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(CPF)
);