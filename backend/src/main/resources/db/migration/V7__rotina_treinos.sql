CREATE TABLE rotina_treinos (
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
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    grupo ENUM('SUPERIORES', 'INFERIORES', 'ABDOMINAL'),

    CONSTRAINT chave_estrangeira_rotina_treinos_rotinas FOREIGN KEY (rotina_id) REFERENCES rotinas(id)
);