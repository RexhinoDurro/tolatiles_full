# ── Development stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ── Production: install all deps for build ────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

# NEXT_PUBLIC_* vars must be present at build time (bundled by webpack).
# Production values come from .env.production (committed to repo).
# Override these build args when building for a non-production target.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ARG NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
ARG NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID
ARG NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
ARG NEXT_PUBLIC_BUSINESS_NAME
ARG NEXT_PUBLIC_BUSINESS_PHONE
ARG NEXT_PUBLIC_BUSINESS_EMAIL
ARG NEXT_PUBLIC_BUSINESS_ADDRESS
ARG NEXT_PUBLIC_FACEBOOK_URL
ARG NEXT_PUBLIC_INSTAGRAM_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY \
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=$NEXT_PUBLIC_GOOGLE_ANALYTICS_ID \
    NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID=$NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID \
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=$NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION \
    NEXT_PUBLIC_BUSINESS_NAME=$NEXT_PUBLIC_BUSINESS_NAME \
    NEXT_PUBLIC_BUSINESS_PHONE=$NEXT_PUBLIC_BUSINESS_PHONE \
    NEXT_PUBLIC_BUSINESS_EMAIL=$NEXT_PUBLIC_BUSINESS_EMAIL \
    NEXT_PUBLIC_BUSINESS_ADDRESS=$NEXT_PUBLIC_BUSINESS_ADDRESS \
    NEXT_PUBLIC_FACEBOOK_URL=$NEXT_PUBLIC_FACEBOOK_URL \
    NEXT_PUBLIC_INSTAGRAM_URL=$NEXT_PUBLIC_INSTAGRAM_URL

COPY . .
RUN npm run build

# ── Production runtime ────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Only production dependencies at runtime
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
