CREATE TABLE preferencia_grupos_musculares (
  `id` varchar(255) PRIMARY KEY NOT NULL,
  `rotina_id` varchar(255) NOT NULL,
  `grupo` ENUM ('SUPERIORES', 'INFERIORES', 'ABDOMINAL') NOT NULL,
  `prioridade` int NOT NULL,

  CONSTRAINT chave_estrangeira_preferencia_grupos_musculares_rotinas FOREIGN KEY (rotina_id) REFERENCES rotinas(id)
);