CREATE TABLE rotina_refeicoes (
    id VARCHAR(255) PRIMARY KEY NOT NULL,
    rotina_id VARCHAR(255) NOT NULL,
    dia_semana ENUM(
        'SEGUNDA',
        'TERCA',
        'QUARTA',
        'QUINTA',
        'SEXTA',
        'SABADO',
        'DOMINGO'
    ) NOT NULL,
    horario TIME NOT NULL,
    nome VARCHAR(255) NOT NULL,

    CONSTRAINT chave_estrangeira_rotina_refeicoes_rotinas FOREIGN KEY (rotina_id) REFERENCES rotinas(id)
);