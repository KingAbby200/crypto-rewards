# Crypto Rewards Dashboard

## Overview

pnpm workspace monorepo using TypeScript. A crypto rewards dashboard where an admin creates personalized user links showing wallet info, eligible ETH balance, withdrawal fee instructions, and payment history. Admin manages users and transactions from a hidden dashboard. Users can request withdrawals and admins verify/reject them.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **Frontend**: React 19 + Vite + TailwindCSS v4 + Shadcn/UI + Framer Motion + Wouter
- **Backend**: Express 5 + MongoDB (Mongoose)
- **Auth**: express-session (admin only)
- **Validation**: Zod (generated from OpenAPI)
- **API codegen**: Orval (OpenAPI → React Query hooks + Zod schemas)
- **Build**: esbuild (CJS bundle for API server)

## Structure

```
├── artifacts/
│   ├── api-server/         # Express API server (port 8080)
│   └── crypto-app/         # React+Vite frontend (port from PORT env)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks + custom-fetch
│   └── api-zod/            # Generated Zod schemas
├── DEPLOYMENT.md           # Local dev + Vercel/Railway deployment guide
├── pnpm-workspace.yaml
└── package.json            # Root: "pnpm dev" runs both servers in parallel
```

## Routes

- `/` — Landing page
- `/u/:slug` — User rewards page (withdrawal request flow)
- `/u/:slug/history` — User payment history
- `/admin/secret-login` — Admin login (intentionally hidden)
- `/admin` — Admin dashboard (lists all users)
- `/admin/users/:slug` — Admin user detail (edit, transactions, verify/reject withdrawals)

## API Endpoints

All routes prefixed with `/api`:

- `GET /healthz`
- `POST /auth/login`, `POST /auth/logout`, `GET /auth/status`
- `GET/POST /users`, `GET/PUT/DELETE /users/:slug`
- `GET/POST /users/:slug/transactions`, `PUT/DELETE /users/:slug/transactions/:txId`
- `GET/POST /users/:slug/withdrawal-request`
- `GET /admin/withdrawal-requests`
- `PUT /admin/withdrawal-requests/:id/verify`
- `PUT /admin/withdrawal-requests/:id/reject`

## Key Files

- `artifacts/api-server/src/app.ts` — Express setup (CORS, session, routes)
- `artifacts/api-server/src/lib/models.ts` — Mongoose models: User, Transaction, WithdrawalRequest
- `artifacts/api-server/src/routes/` — Route handlers
- `artifacts/api-server/src/lib/auth.ts` — `requireAdmin` middleware
- `artifacts/crypto-app/src/hooks/` — React Query hook wrappers
- `artifacts/crypto-app/src/pages/user/congrats.tsx` — User withdrawal flow
- `artifacts/crypto-app/src/pages/admin/user-detail.tsx` — Admin verify/reject
- `lib/api-client-react/src/custom-fetch.ts` — Fetch wrapper (supports VITE_API_BASE_URL)
- `lib/api-spec/openapi.yaml` — Source of truth for all API types

## Environment Variables

### API Server
- `MONGODB_URI` — MongoDB Atlas connection string (required)
- `ADMIN_PASSWORD` — Admin panel password (required)
- `SESSION_SECRET` — Session signing secret (defaults to hardcoded dev value)
- `PORT` — Defaults to `8080`
- `CORS_ORIGIN` — Allowed origins, comma-separated (defaults to all)

### Frontend
- `VITE_API_BASE_URL` — Full URL of API server, for production deployments only
- `PORT` — Defaults to `3000`
- `API_PORT` — Local API port for Vite proxy (defaults to `8080`)
- `BASE_PATH` — App base path (defaults to `/`)

## Running Locally

```bash
pnpm install
cp artifacts/api-server/.env.example artifacts/api-server/.env   # fill in values
pnpm dev   # starts both servers
```

See `DEPLOYMENT.md` for full Vercel + Railway production setup.

## Codegen

After changing `lib/api-spec/openapi.yaml`:
```bash
pnpm --filter @workspace/api-spec run codegen
```

## TypeScript

- Typecheck from root: `pnpm run typecheck`
- All packages extend `tsconfig.base.json` with composite mode
- `emitDeclarationOnly` — JS bundling is esbuild/Vite, not tsc

## Design Notes

- Dark glassmorphism UI: background `225 50% 6%`, primary `195 100% 50%` (electric cyan), accent `280 100% 60%` (neon purple)
- CSS utilities: `text-gradient`, `glass-panel` defined in `index.css`
- `formatEth()`, `truncateWallet()` in `artifacts/crypto-app/src/lib/utils.ts`
- Replit-specific Vite plugins only load when `REPL_ID` env var is present
