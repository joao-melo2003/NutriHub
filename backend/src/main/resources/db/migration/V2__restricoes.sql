CREATE TABLE restricoes (
  `id` varchar(255) PRIMARY KEY NOT NULL,
  `nome` varchar(255) NOT NULL,
  `tipo` ENUM ('INTOLERANCIA', 'ALERGIA', 'CONDICAO', 'RESTRICAO') NOT NULL
);