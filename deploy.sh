#!/bin/bash
set -e

INFISICAL_CLIENT_ID="76e2fabb-c228-4b3e-9ffa-db9f79e8d28b"
INFISICAL_CLIENT_SECRET="57daa580854c4d6ea7f1043ac0215d7edede2cd38f672ba07d81cf722143afcb"
INFISICAL_PROJECT_ID="b61739d7-902d-4a32-8d23-3b02096246e0"
INFISICAL_ENV="prod"

cd "$(dirname "$0")"

echo "→ Fetching secrets from Infisical..."
TOKEN=$(infisical login \
  --method=universal-auth \
  --client-id="$INFISICAL_CLIENT_ID" \
  --client-secret="$INFISICAL_CLIENT_SECRET" \
  --plain --silent)

# Export all secrets as env vars
eval "$(infisical export \
  --token="$TOKEN" \
  --projectId="$INFISICAL_PROJECT_ID" \
  --env="$INFISICAL_ENV" \
  --format=dotenv | sed 's/^/export /')"

# Derive POSTGRES_PASSWORD from DATABASE_URL
# Format: postgres://user:password@host:port/db
export POSTGRES_PASSWORD=$(echo "$DATABASE_URL" | sed 's|postgres://[^:]*:\([^@]*\)@.*|\1|')

# Rewrite hostnames for Docker networking
export DATABASE_URL=$(echo "$DATABASE_URL" | sed 's/@localhost:/@db:/g' | sed 's/@127.0.0.1:/@db:/g')
export CELERY_BROKER_URL=$(echo "$CELERY_BROKER_URL" | sed 's|redis://localhost|redis://redis|g')
export REDIS_HOST="redis"

echo "→ Pulling latest code..."
git pull origin main

echo "→ Building and starting containers..."
sudo -E docker compose -f docker-compose.prod.yml up --build -d

echo "→ Done. Running containers:"
sudo docker compose -f docker-compose.prod.yml ps
