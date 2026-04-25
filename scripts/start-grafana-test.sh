#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONTAINER_NAME="mmm-grafana-gauges-test"
IMAGE="grafana/grafana:10.4.6"
HOST_PORT="${GRAFANA_TEST_PORT:-3000}"

if docker ps -a --format '{{.Names}}' | grep -Fxq "$CONTAINER_NAME"; then
    echo "Removing existing container: $CONTAINER_NAME"
    docker rm -f "$CONTAINER_NAME" >/dev/null
fi

echo "Starting Grafana test instance on http://localhost:${HOST_PORT}"
docker run -d \
    --name "$CONTAINER_NAME" \
    -p "${HOST_PORT}:3000" \
    -e GF_AUTH_ANONYMOUS_ENABLED=true \
    -e GF_AUTH_ANONYMOUS_ORG_ROLE=Viewer \
    -e GF_AUTH_DISABLE_LOGIN_FORM=true \
    -e GF_SECURITY_ALLOW_EMBEDDING=true \
    -v "$REPO_ROOT/test/grafana/provisioning:/etc/grafana/provisioning:ro" \
    "$IMAGE" >/dev/null

echo
echo "Grafana test instance started."
echo "Dashboard URL: http://localhost:${HOST_PORT}/d/as8fA8na/flowers"
echo "Module config values:"
echo "  host: \"localhost\""
echo "  port: ${HOST_PORT}"
echo "  version: 6"
echo "  id: \"as8fA8na\""
echo "  dashboardname: \"flowers\""
echo "  orgId: 1"
echo "  showIDs: [8, 9, 10, 12]"
