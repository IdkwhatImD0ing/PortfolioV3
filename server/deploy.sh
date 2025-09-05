#!/usr/bin/env bash
set -euo pipefail || set -eu

### ====== Config (edit these) ======
PROJECT_ID="${PROJECT_ID:-spiritual-storm-469704-n2}"
REGION="${REGION:-us-west1}"                  # e.g. us-west1
SERVICE_NAME="${SERVICE_NAME:-fastapi-ws}"    # Cloud Run service name
MAX_INSTANCES="${MAX_INSTANCES:-10}"          # cap autoscaling so costs don't spike
CONCURRENCY="${CONCURRENCY:-200}"             # WS are long-lived; raise only if your app can handle it
TIMEOUT="${TIMEOUT:-3600}"                    # seconds; Cloud Run supports up to 60m for WS
KEEP_WARM="${KEEP_WARM:-0}"                   # 1 = keep 1 warm instance (no cold start), 0 = scale to zero
ALLOW_UNAUTH="${ALLOW_UNAUTH:-1}"             # 1 = public URL
KEY_FILE="${KEY_FILE:-./gcloud.json}"         # your SA key path
### =================================

echo "▶ Authenticating with service account key: $KEY_FILE"
gcloud auth activate-service-account --key-file="$KEY_FILE"

SA_EMAIL="$(gcloud auth list --filter=status:ACTIVE --format='value(account)')"
SA_RESOURCE="projects/${PROJECT_ID}/serviceAccounts/${SA_EMAIL}"
echo "Using account: $SA_EMAIL"
echo "Build SA resource: $SA_RESOURCE"

echo "▶ Setting project & region…"
gcloud --quiet config set project "$PROJECT_ID" >/dev/null
gcloud --quiet config set run/region "$REGION" >/dev/null
gcloud --quiet config set account "$SA_EMAIL" >/dev/null

echo "▶ Enabling APIs (Run, Build, Artifact Registry)…"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --project "$PROJECT_ID" \
  || echo "Skipping API enable (no permission or already enabled)."

# Choose min instances based on KEEP_WARM
if [[ "$KEEP_WARM" == "1" ]]; then
  MIN_INSTANCES=1
else
  MIN_INSTANCES=0
fi

# Auth flag
if [[ "$ALLOW_UNAUTH" == "1" ]]; then
  AUTH_FLAG="--allow-unauthenticated"
else
  AUTH_FLAG="--no-allow-unauthenticated"
fi

echo "▶ Deploying $SERVICE_NAME to Cloud Run (build from source)…"
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --region "$REGION" \
  --service-account "$SA_EMAIL" \
  --build-service-account "$SA_RESOURCE" \
  --concurrency "$CONCURRENCY" \
  --min-instances "$MIN_INSTANCES" \
  --max-instances "$MAX_INSTANCES" \
  --timeout "${TIMEOUT}s" \
  --execution-environment gen2 \
  $AUTH_FLAG

echo "✅ Deployed. Default URL:"
gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format='value(status.url)'

CUSTOM_DOMAIN="portfolio-ws.art3m1s.me"

# Check if mapping exists
if gcloud run domain-mappings describe "$CUSTOM_DOMAIN" --region "$REGION" >/dev/null 2>&1; then
  echo "▶ Domain mapping for $CUSTOM_DOMAIN already exists."
else
  echo "▶ Creating domain mapping for $CUSTOM_DOMAIN…"
  gcloud run domain-mappings create --service "$SERVICE_NAME" \
    --domain "$CUSTOM_DOMAIN" \
    --region "$REGION"
fi

echo "✅ Service is mapped to: https://$CUSTOM_DOMAIN"
