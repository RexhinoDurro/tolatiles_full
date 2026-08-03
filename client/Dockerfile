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
# next.config.js reads process.env.NEXT_PUBLIC_R2_MEDIA_HOSTNAME, and `next
# start` re-evaluates next.config.js at runtime (not just at build time) --
# without .env.production also present here, that read comes back undefined
# and silently drops the R2 remotePattern, even though it was baked into the
# build correctly. Without this, the image optimizer 400s on any R2 image
# with "url parameter is not allowed".
COPY --from=builder /app/.env.production ./.env.production

EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
