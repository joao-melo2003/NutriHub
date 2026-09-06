FROM node:22

WORKDIR /app

RUN npm install -g pnpm@11.3.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm --version

RUN pnpm install --frozen-lockfile

COPY . .

ENV CI=true

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]