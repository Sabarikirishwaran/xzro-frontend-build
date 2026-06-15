# xZro frontend

xZro is a verifier-first strategy intelligence interface for crypto markets. The frontend scans venue state through an authenticated server proxy, presents strategy candidates, and summarizes cost and risk gate decisions without live execution.

## Routes

- `/` - product overview
- `/dashboard` - strategy console
- `/about` - concise system explanation
- `/api/xzro/health` - authenticated backend health proxy
- `/api/xzro/cycle` - authenticated strategy scan proxy

## Local setup

Install dependencies and start the development server:

```bash
pnpm install
pnpm dev
```

Create `.env.local` with server-only backend configuration:

```env
XZRO_BACKEND_URL=https://your-backend.example
XZRO_BACKEND_API_KEY=your-secret-key
```

Browser requests must use the internal `/api/xzro/*` routes.

## Validation

```bash
pnpm build
pnpm typecheck
```

The strategy console supports a live Hyperliquid scan and a deterministic safe sample. Raw backend data is sanitized and hidden in a collapsed developer panel.
