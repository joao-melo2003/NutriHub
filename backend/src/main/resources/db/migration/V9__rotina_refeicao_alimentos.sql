CREATE TABLE rotina_refeicao_alimentos (
    id VARCHAR(255) PRIMARY KEY NOT NULL,
    refeicao_id VARCHAR(255) NOT NULL,
    alimento_id VARCHAR(255) NOT NULL,
    quantidade NUMERIC(8, 2) NOT NULL,

    CONSTRAINT chave_estrangeira_rotina_refeicao_alimento_rotina_refeicoes FOREIGN KEY (refeicao_id) REFERENCES rotina_refeicoes(id),
    CONSTRAINT chave_estrangeira_rotina_refeicao_alimento_alimentos FOREIGN KEY (alimento_id) REFERENCES alimentos(id)
);