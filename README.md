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
## Validation

```bash
pnpm build
pnpm typecheck
```

The strategy console supports a live Hyperliquid scan and a deterministic safe sample. Raw backend data is sanitized and hidden in a collapsed developer panel.
