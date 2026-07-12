@echo off
REM Developer convenience: run API + Next.js together (not for end users).
set ROOT=%~dp0

start "visora-api" cmd /k "cd /d %ROOT%backend && python -m uvicorn api:app --reload --host 127.0.0.1 --port 8000"
start "visora-web" cmd /k "cd /d %ROOT%frontend && npm run dev -- --port 3000"

echo API  http://127.0.0.1:8000
echo Web  http://127.0.0.1:3000
echo Two terminal windows started. Close them to stop.
