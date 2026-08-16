#!/usr/bin/env bash
# Configures Cadence domains with READ_GROUPS/WRITE_GROUPS for local OIDC auth testing.
# Requires: docker backend stack, Keycloak with direct access grants on cadence-web client.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CADENCE_IP="$(docker exec cadence-web-cadence-1 hostname -i | awk '{print $1}')"
CAD_CMD=(docker exec cadence-web-cadence-1 cadence --ad "${CADENCE_IP}:7833" -t grpc)

get_token() {
  local user="$1" pass="$2"
  curl -sf -X POST 'http://localhost:8080/realms/cadence/protocol/openid-connect/token' \
    -H 'Content-Type: application/x-www-form-urlencoded' \
    -d "grant_type=password" \
    -d 'client_id=cadence-web' \
    -d 'client_secret=cadence-web-secret' \
    -d "username=${user}" \
    -d "password=${pass}" \
    -d 'scope=openid profile email' \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])"
}

echo "Fetching admin token..."
ADMIN_JWT="$(get_token admin-user admin-password)"

cadence_with_auth() {
  "${CAD_CMD[@]}" --jwt "$ADMIN_JWT" "$@"
}

update_domain_groups() {
  local domain="$1" read_groups="$2" write_groups="$3"
  echo "Updating domain: ${domain}"
  cadence_with_auth --do "$domain" domain update \
    --domain_data "READ_GROUPS=${read_groups},WRITE_GROUPS=${write_groups}" \
    --reason "OIDC auth POC setup" 2>/dev/null || true
}

register_domain() {
  local domain="$1" read_groups="$2" write_groups="$3"
  if cadence_with_auth --do "$domain" domain describe >/dev/null 2>&1; then
    update_domain_groups "$domain" "$read_groups" "$write_groups"
    return
  fi
  echo "Registering domain: ${domain}"
  cadence_with_auth --do "$domain" domain register \
    --rd 1 \
    --desc "Auth POC test domain (${domain})" \
    --oe "owner@cadence.local" \
    --domain_data "READ_GROUPS=${read_groups},WRITE_GROUPS=${write_groups}"
}

# Group lists use spaces — commas separate domain_data keys, not group names.
update_domain_groups default "cadence-readers cadence-writers cadence-admin" "cadence-writers cadence-admin"
register_domain writers-only "cadence-writers cadence-admin" "cadence-writers cadence-admin"
register_domain admin-only "cadence-admin" "cadence-admin"

echo "Done. Domains configured with group metadata."
