#!/bin/zsh
# ======================================================
# OncoDetect — Local Dev Startup Script
# Starts both the FastAPI backend and Vite frontend.
# ======================================================

set -e

echo "\n\033[1;32m>>> OncoDetect: Starting services...\033[0m\n"

# ── Backend ─────────────────────────────────────────
echo "\033[0;36m[1/2] Starting FastAPI backend on :8000...\033[0m"
cd "$(dirname "$0")/oncodetect/backend"

if [ ! -d ".venv" ]; then
  echo "  Creating virtual environment..."
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install -r requirements.txt -q

uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID"

# ── Frontend ─────────────────────────────────────────
echo "\033[0;36m[2/2] Starting Vite frontend on :5173...\033[0m"
cd "$(dirname "$0")/oncodetect/frontend"
npm install -q
npm run dev &
FRONTEND_PID=$!
echo "  Frontend PID: $FRONTEND_PID"

echo "\n\033[1;32m>>> Both services are running!\033[0m"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000\n"

# Keep script alive and handle Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '\n>>> Shutting down.'" EXIT
wait
