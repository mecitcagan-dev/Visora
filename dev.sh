#!/usr/bin/env bash
# Developer convenience: run API + Next.js together (not for end users).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"

(
  cd "$ROOT/backend"
  python -m uvicorn api:app --reload --host 127.0.0.1 --port 8000
) &
API_PID=$!

(
  cd "$ROOT/frontend"
  npm run dev -- --port 3000
) &
WEB_PID=$!

trap 'kill $API_PID $WEB_PID 2>/dev/null || true' EXIT INT TERM
echo "API  http://127.0.0.1:8000"
echo "Web  http://127.0.0.1:3000"
wait
