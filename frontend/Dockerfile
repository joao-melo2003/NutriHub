FROM node:22

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="/pnpm/bin:/pnpm:$PATH"
ENV npm_config_store_dir="/pnpm/store"

RUN npm install -g pnpm@11.3.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

EXPOSE 3000

CMD ["pnpm", "dev"]