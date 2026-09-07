# Workflow de Desenvolvimento — NutriHub

Este documento define o fluxo padrão para desenvolvimento, testes e integração das funcionalidades do NutriHub.

## Fluxo de desenvolvimento

Toda tarefa deve seguir o fluxo:

```text
    1. Atualizar a main
            ↓
    2. Criar uma branch para a tarefa
            ↓
    3. Atualizar/reconstruir as imagens Docker
            ↓
    4. Subir os containers necessários
            ↓
    5. Desenvolver a tarefa
            ↓
    6. Testar
            ↓
    7. Commit
            ↓
    8. Push da branch
            ↓
    9. Abrir Pull Request 
            ↓
    10. Review (GERENTE)
            ↓
    11. Testar novamente a branch (Se necessário)
            ↓
    12. Aprovar o PR (GERENTE)
            ↓
    13. Merge na main 
            ↓
    14. Atualizar a main local
```

# 1. Atualizar a main

Antes de iniciar uma nova tarefa, sempre garanta que sua main está atualizada para não dar conflito:

    git checkout main
    git pull origin main

# 2. Criar uma branch

Cada tarefa deve ser desenvolvida em uma branch própria. Após atualizar a main sempre crie uma branch para trabalhar,
nunca faça as alterações na main para não dar conflito nas outras traferas.

Exemplo:

    git checkout -b feature/login

Não desenvolver diretamente na main. 

### KABAN 
As tarefas serão enviadas via `KABAN` no github. 

Para acessar basta fazer:
    github/projetos ou repositorios/Nutrihub/projetos/Tasks - NutriHub

### FEATURE RELEASE
As funcionalidades totais, requisitos e objetivos ficarão no `FEATURE RELEASE`, aqui é mais para acompanhamento 
as tasks estarão no `KABAN`.

Para acessar basta fazer:

    github/projetos ou repositorios/Nutrihub/projetos/Feature release - NutriHub

# 3. Subir o ambiente Docker

Depois de criar a branch, reconstrua as imagens necessárias e inicie os containers.

- Frontend:
    ```text 
    docker compose up -d --build frontend
Se a tarefa for relacionada ao frontend faça o container baseado apenas no frontend

- Backend: 
    ```text 
    docker compose up -d --build backend
Se a tarefa for relacionada ao backend faça o container baseado apenas no backend
- Sistema completo
    ```text 
    docker compose up -d --build
Se for necessário testar frontend + backend + banco 

Sempre que houver alteração no código que precisa ser incorporada à imagem, utilize --build.
Não estar errado sempre recontruir todas as imagens é mais para economizar RAM e processamento.

# 4. Testes

O desenvolvedor deve testar a funcionalidade antes de abrir o Pull Request.

- Frontend

Testar a aplicação em:

    http://localhost:3000

- Backend

Testar os endpoints utilizando o Postman:

    http://localhost:8080
- Sistema completo

Quando a funcionalidade envolver o fluxo completo:

    Frontend
    ↓
    Backend
    ↓
    MariaDB

suba todos os serviços:

    docker compose up -d --build


# 5. Commit, Push e Pull Request

Depois de desenvolver e testar:

```text 
git status
git add .
git commit -m "Feat: implementa login"
git push -u origin feature/login
```

### Depois, abra um Pull Request:

- O PR deve conter uma descrição breve da alteração
- O que foi alterado
- Informações sobre como testar.

# 6. Review e aprovação

O responsável (João Vitor) pelo projeto deve testar a própria branch do Pull Request.

```text
git fetch origin
git checkout feature/login
docker compose up -d --build
```

### Após revisar e aprovar:

Será enviado uma mensagem ao dev para que ele clique na opção `squash and merge` no PR.

### Após revisar e reprovar

O desenvolvedor corrige na mesma branch e faz novo push.

# 7. Após o Merge

Depois que uma tarefa entrar na main, sempre atualize sua cópia local antes de iniciar outra tarefa:

```text 
git checkout main
git pull origin main
```
    
Depois crie a próxima branch:

```text 
git checkout -b feature/nova-task
Docker (comandos docker)
```


# REGRA IMPORTANTE

Sempre que baixar alterações do GitHub, primeiro atualize o código e depois reconstrua as imagens necessárias.

```text 
git pull origin main

docker compose up -d --build

Alteração somente no Frontend
docker compose up -d --build frontend

Alteração somente no Backend
docker compose up -d --build backend

Alteração no sistema completo
docker compose up -d --build
```

# 8. Banco de dados
O banco MariaDB possui persistência através de Docker Volume.

Portanto:

    docker compose down
não apaga os dados do banco

### Migrations

As alterações na estrutura do banco devem ser feitas através de novas migrations utilizando Flyway.

Exemplo:

```text
V1__create_users.sql
V2__add_email_to_users.sql
V3__create_foods.sql
```

Não é necessário apagar o banco quando uma nova migration for criada, não utilize `down -v`. 

O Flyway identifica automaticamente as migrations que ainda não foram executadas e aplica somente as pendentes.

Os dados existentes permanecem.

    Migration nova → apenas atualizar/aplicar a migration.

### Recriar o banco

Somente utilize:

    docker compose down -v
    docker compose up -d --build

quando for solicitado pelo gerente, para apagar o banco todo. Pois `down -v` remove o volume e consequentemente, os dados persistidos.

# Regras da equipe
1. Não desenvolver diretamente na main.
2. Sempre atualize a main antes de criar uma nova branch.
3. Cada tarefa deve possuir sua própria branch.
4. Teste a funcionalidade antes de abrir o PR.
5. Use o Postman para testar as APIs do Backend quando necessário.
6. Ao baixar alterações, atualize o código e reconstrua as imagens Docker necessárias.
7. Para testar somente o Frontend, suba o Frontend.
8. Para testar somente o Backend, suba o Backend.
9. Para testar o sistema completo, suba todos os serviços.
10. Migrations novas não exigem apagar o banco. O Flyway aplica somente as migrations pendentes.
11. Não utilize docker compose down -v sem necessidade, pois ele apaga os dados persistidos do banco.
12. Todo código novo deve passar por Pull Request e review antes de entrar na main.

                            NÃO ENVIE IMAGENS DOCKER PARA O GIT. O REPOSITÓRIO DEVE CONTER OS DOCKERFILES E ARQUIVOS NECESSÁRIOS PARA RECONSTRUÍ-LAS.