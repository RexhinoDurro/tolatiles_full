# ── Development stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ── Production: install all deps for build ────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# NEXT_PUBLIC_* vars are baked in at build time by webpack.
# Values come from .env.production (committed to repo) — no build args needed.
COPY . .
RUN npm run build

# ── Production runtime ────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Only production dependencies at runtime
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
