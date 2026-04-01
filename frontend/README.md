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

## Local Dev Login

```text
username: admin
password: password123
```

For deployed environments, create credentials through the backend configuration instead of relying on the local development default.

## Notes

- The frontend is designed as a cinematic healthcare prototype with honest operational copy.
- Protected routes require a valid auth token from the FastAPI backend and are revalidated on refresh.
- The report screen supports history rehydration, copy summary, and PDF export.
- The intake flow currently accepts PNG, JPG, and WEBP uploads for local analysis.
