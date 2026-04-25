#!/usr/bin/env bash

set -euo pipefail

CONTAINER_NAME="mmm-grafana-gauges-test"

if docker ps -a --format '{{.Names}}' | grep -Fxq "$CONTAINER_NAME"; then
    docker rm -f "$CONTAINER_NAME"
else
    echo "Container $CONTAINER_NAME is not running."
fi
