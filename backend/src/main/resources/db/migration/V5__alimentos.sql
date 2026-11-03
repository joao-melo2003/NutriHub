CREATE TABLE alimentos (
    id varchar(255) PRIMARY KEY NOT NULL,
    nome varchar(255) NOT NULL,
    categoria ENUM ('CEREAIS', 'TUBERCULOS_RAIZES', 'HORTALICAS', 'FRUTAS', 'CARNES_OVOS', 'LATICINEOS', 'OLEOS_GORDURAS', 'ACUCARES') NOT NULL,
    calorias INT NOT NULL,
    proteina numeric(6,2) NOT NULL,
    carboidratos numeric(6,2) NOT NULL,
    gorduras numeric(6,2) NOT NULL
);
