CREATE TABLE usuarios (
    `CPF` char(11) PRIMARY KEY NOT NULL,
    `nome` varchar(255) NOT NULL,
    `email` varchar(255) UNIQUE NOT NULL,
    `senha` varchar(255) NOT NULL,
    `dataNascimento` date NOT NULL,
    `sexo` ENUM ('M', 'F') NOT NULL,
    `tipo` ENUM ('ADMIN', 'COMUM') NOT NULL,
    `status` ENUM ('ATIVO', 'BANIDO') NOT NULL
);