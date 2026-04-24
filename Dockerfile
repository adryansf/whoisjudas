FROM oven/bun:1-alpine AS base
RUN apk update && apk add --no-cache git && apk add --no-cache libc6-compat
RUN bun add -g turbo


FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune server --docker

FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/pnpm-lock.yaml ./pnpm-lock.yaml
RUN bun add -g pnpm
RUN pnpm install --frozen-lockfile

# Stage 5: Production runner
EXPOSE 3001

ENV PORT=3001
ENV NODE_ENV=production
ENV CORS_ORIGIN=*

CMD ["bun", "apps/server/src/index.ts"]
