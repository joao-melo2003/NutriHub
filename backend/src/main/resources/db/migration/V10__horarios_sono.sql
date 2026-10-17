CREATE TABLE horarios_sono (
    `id` varchar(255) PRIMARY KEY NOT NULL,
    `rotina_id` varchar(255) NOT NULL,
    `dia_semana` ENUM ('SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO') NOT NULL,
    `horario_dormir` time NOT NULL,
    `horario_acordar` time NOT NULL,

    CONSTRAINT chave_estrangeira_horarios_sono_rotinas FOREIGN KEY (rotina_id) REFERENCES rotinas(id)
);
