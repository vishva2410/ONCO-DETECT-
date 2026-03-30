# OncoDetect Frontend

This is the React + Vite frontend for OncoDetect.

## Pages

- Entrance
- Sign In
- Dashboard
- New Analysis
- Analysis
- Report
- History

## Dev Run

```bash
npm install
npm run dev
```

Default local URL:

```text
http://127.0.0.1:5173
```

## Backend Integration

During local development, Vite proxies `/api` requests to the backend.

Default proxy target:

```text
http://127.0.0.1:8000
```

Override it when needed:

```bash
VITE_BACKEND_PROXY_URL=http://127.0.0.1:8004 npm run dev
```

For deployed environments, set:

```bash
VITE_API_URL=https://your-api.example.com
```

## Demo Login

```text
username: admin
password: password123
```

## Notes

- The frontend is designed as a cinematic healthcare product demo.
- Protected routes require a valid auth token from the FastAPI backend.
- The report screen supports history rehydration, copy summary, print, and PDF export.
