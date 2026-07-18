#!/bin/bash
set -e

INFISICAL_CLIENT_ID="76e2fabb-c228-4b3e-9ffa-db9f79e8d28b"
INFISICAL_CLIENT_SECRET="57daa580854c4d6ea7f1043ac0215d7edede2cd38f672ba07d81cf722143afcb"
INFISICAL_PROJECT_ID="b61739d7-902d-4a32-8d23-3b02096246e0"
INFISICAL_ENV="prod"
CLOUDFLARE_ZONE_ID="00d58edff5e3b08ba1246dc4ceba29c1"

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

# Files that arrive via git (as opposed to a Django upload, which sets its own
# FILE_UPLOAD_PERMISSIONS) inherit this shell's umask. If that umask strips the
# world-read bit, nginx (running as www-data, serving /media/ directly off disk)
# gets 403s on anything just pulled. Normalize after every pull so this can't recur.
chmod -R a+rX server/media 2>/dev/null || true

echo "→ Building and starting containers..."
sudo -E docker compose -f docker-compose.prod.yml up --build -d

echo "→ Done. Running containers:"
sudo docker compose -f docker-compose.prod.yml ps

echo "→ Purging Cloudflare cache..."
if [ -n "$CLOUDFLARE_ZONE_SETTINGS_KEY" ] && [ -n "$CLOUDFLARE_ZONE_ID" ]; then
  curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
    -H "Authorization: Bearer $CLOUDFLARE_ZONE_SETTINGS_KEY" \
    -H "Content-Type: application/json" \
    -d '{"purge_everything":true}' | python3 -c "import json,sys; d=json.load(sys.stdin); print('  purged ok' if d['success'] else f'  purge failed: {d[\"errors\"]}')"
else
  echo "  skipped (CLOUDFLARE_ZONE_SETTINGS_KEY not set)"
fi
