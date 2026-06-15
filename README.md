# xZro frontend

xZro is a verifier-first strategy intelligence interface for crypto markets.

## Routes

- `/` - product overview
- `/dashboard` - strategy console
- `/about` - workflow information
- `/api/xzro/session` - short-lived demo access session
- `/api/xzro/health` - protected service availability check
- `/api/xzro/cycle` - protected strategy scan

## Local setup

Install dependencies, copy `.env.example` to `.env.local`, set the required
server-only values, and start the development server:

```bash
pnpm install
pnpm dev
```

Required environment variables:

- `XZRO_BACKEND_URL`
- `XZRO_BACKEND_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `FRONTEND_DEMO_KEY` - signs short-lived browser sessions automatically. Use
  a random value of at least 24 characters. It is never sent to the browser.

The Vercel KV aliases `KV_REST_API_URL` and `KV_REST_API_TOKEN` are also
accepted in place of the Upstash names.

Never use the `NEXT_PUBLIC_` prefix for these values.

## Security

Public API requests are constrained to a fixed scan configuration, protected
by per-client and global Upstash limits, and forwarded with the private service
credential only from server code. The server automatically issues a signed,
short-lived HttpOnly session cookie; the signing secret is never sent to or
stored by browser code.

Production client-IP enforcement trusts only Vercel's protected
`x-vercel-forwarded-for` header and fails closed outside that environment.

Upstream error bodies are not returned to callers. Successful scan responses
are size-limited and stripped of credential-like or raw order-book fields.

## Validation

```bash
pnpm typecheck
pnpm build
```
