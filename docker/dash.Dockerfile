FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund --legacy-peer-deps || npm install --no-audit --no-fund --legacy-peer-deps
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS=--max-old-space-size=1536
COPY . .
RUN npm run build && npm prune --omit=dev --no-audit --no-fund && rm -rf .next/cache

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
COPY --from=build --chown=node:node /app ./
USER node
EXPOSE 3000
CMD ["node_modules/.bin/next", "start", "-p", "3000", "-H", "0.0.0.0"]
