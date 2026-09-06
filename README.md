# NutriHub

Sistema web desenvolvido para o projeto NutriHub.

O projeto é composto por um frontend em Next.js, um backend em Spring Boot e um banco de dados MariaDB. Todo o ambiente de desenvolvimento é executado através do Docker.

---

## Tecnologias

### Frontend

- Next.js 14.2.35
- React 18.3.1
- TypeScript 5.9.3
- Tailwind CSS 3.4.19
- Node.js 22
- pnpm 11.3.0

### Backend

- Java 25
- Spring Boot 4.1.1
- Maven
- Flyway
- Hibernate/JPA

### Banco de dados

- MariaDB 11.8

### Infraestrutura

- Docker
- Docker Compose
- Git / GitHub

---

## Estrutura do projeto básica 
Essa estrutura sofrerá mudanças ao decorrer do projeto

```text
nutrihub/
├── backend/
│   ├── src/
│   ├── pom.xml
│   ├── mvnw
│   ├── mvnw.cmd
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── pnpm-workspace.yaml
│   └── Dockerfile
│
├── compose.yml
├── .env.example
└── README.md
```

---

## Pré-requisitos
Para executar o projeto, é necessário ter instalado:

- Git
- Docker
- Docker Compose

Não é necessário instalar Java, Node.js, pnpm ou MariaDB diretamente na máquina, essas dependências são executadas dentro dos containers.

---

## Passo a Passo para executar o projeto

Vai em qualquer pasta pessoal para clonar e configurar o projeto no seu computador

### 1. Clonar o projeto

    git clone https://github.com/joao-melo2003/NutriHub.git

### 2. Configurar as variáveis de ambiente

Entre na pasta do projeto: cd nutrihub

O projeto utiliza um arquivo .env para as configurações do ambiente.

Copie o arquivo de exemplo:

    cp .env.example .env

O arquivo deverá conter as variáveis necessárias para o banco:

```text
DB_NAME=nutrihub
DB_USER=nutrihub
DB_PASSWORD=nutrihub
DB_ROOT_PASSWORD=nutrihub_root
```

Não altere o .env.example. 

O arquivo `.env` é utilizado localmente e não deve ser versionado, certifique de conferir no .gitignore se o `.env` está la para não ser enviado ao github.

### 3. Executar o projeto

Na raiz do projeto, execute:

    docker compose up -d --build

Esse comando irá:

- Criar o container do MariaDB;
- Criar a imagem do backend;
- Criar a imagem do frontend;
- Iniciar todos os serviços;
- Criar o volume persistente do banco de dados.

O comando colocará tudo em segundo plano por conta da `-d`

Para derrubar os containers basta fazer:

    docker compose down

Para verificar os containers:

    docker compose ps

### 4. Acessar o sistema

Após os containers iniciarem:

Frontend:

    http://localhost:3000
Backend:
    http://localhost:8080

O localhost vai te enviar para a página do spring security, o login e senha definido em `application.yaml` em resources do backend é:
- login: user
- password: 12345

Para fazer os testes das API's no postman não será necessário, já que, será criado um user padrão, mas fica o registro por garantia.

Banco de dados: 

    O MariaDB estará disponível na porta 3306