# Deployment Guide — Crypto Rewards Dashboard

This guide covers **local development** and deploying to **Vercel** (frontend) + **Railway** (backend API) with **MongoDB Atlas** as the database.

---

## Local Development

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [pnpm](https://pnpm.io/installation) (`npm install -g pnpm`)
- A MongoDB connection string (see MongoDB Atlas setup below, or use a local MongoDB instance)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy the example files and fill in your values:

```bash
cp artifacts/api-server/.env.example artifacts/api-server/.env
cp artifacts/crypto-app/.env.example artifacts/crypto-app/.env
```

**`artifacts/api-server/.env` — required fields:**
```
PORT=8080
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
ADMIN_PASSWORD=your-admin-password
SESSION_SECRET=any-long-random-string
```

**`artifacts/crypto-app/.env` — defaults are fine for local dev:**
```
PORT=3000
API_PORT=8080
```
The Vite dev server automatically proxies all `/api` requests to `localhost:8080`, so you don't need to set `VITE_API_BASE_URL` locally.

### 3. Start both servers

```bash
pnpm dev
```

This runs the API server (`localhost:8080`) and the frontend (`localhost:3000`) in parallel.

- **Frontend**: http://localhost:3000
- **Admin panel**: http://localhost:3000/admin/secret-login
- **User pages**: http://localhost:3000/u/:slug

---

## MongoDB Atlas Setup

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free account.
2. Create a **Project** and a **Cluster** (the free M0 tier is sufficient).
3. Under **Database Access**, create a user with **read/write** permissions.
4. Under **Network Access**, add `0.0.0.0/0` (allow all IPs) for development, or restrict to your server's IP in production.
5. Click **Connect → Drivers** and copy the connection string. Replace `<password>` with your database user's password.

---

## Production Deployment

### Architecture

```
Browser → Vercel (React frontend) → Railway (Express API) → MongoDB Atlas
```

---

### Step 1: Deploy the API server on Railway

1. Create an account at [https://railway.app](https://railway.app).
2. Create a new project and click **Deploy from GitHub repo**.
3. Select your repository.
4. In the service settings, set the **Root Directory** to `artifacts/api-server`.
5. Set the **Start Command** to:
   ```
   node dist/index.cjs
   ```
6. Set the **Build Command** to:
   ```
   npm install -g pnpm && pnpm install && pnpm --filter @workspace/api-server run build
   ```
7. Add the following **environment variables** in the Railway dashboard:

   | Variable | Value |
   |---|---|
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `ADMIN_PASSWORD` | Your chosen admin password |
   | `SESSION_SECRET` | A long random string (e.g. `openssl rand -hex 32`) |
   | `CORS_ORIGIN` | Your Vercel frontend URL (e.g. `https://your-app.vercel.app`) |
   | `NODE_ENV` | `production` |

8. After deploying, note the generated Railway URL (e.g. `https://your-api.up.railway.app`).

---

### Step 2: Deploy the frontend on Vercel

1. Create an account at [https://vercel.com](https://vercel.com).
2. Click **Add New Project** and import your GitHub repository.
3. In the project settings:
   - **Root Directory**: `artifacts/crypto-app`
   - Vercel will auto-detect the `vercel.json` and use the correct build settings.
4. Add the following **environment variable** in the Vercel dashboard:

   | Variable | Value |
   |---|---|
   | `VITE_API_BASE_URL` | Your Railway API URL (e.g. `https://your-api.up.railway.app`) |

5. Click **Deploy**.

> **How it works**: When `VITE_API_BASE_URL` is set, the frontend prefixes all API calls with that URL. When it's unset (local dev), calls go to the same origin and the Vite proxy handles routing to your local API server.

---

## Environment Variables Reference

### API Server (`artifacts/api-server`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `ADMIN_PASSWORD` | Yes | — | Password for the admin panel |
| `SESSION_SECRET` | No | hardcoded dev value | Secret for signing sessions — always set in production |
| `PORT` | No | `8080` | Port the API server listens on |
| `CORS_ORIGIN` | No | `*` (all) | Comma-separated list of allowed origins |
| `NODE_ENV` | No | `development` | Set to `production` in production |

### Frontend (`artifacts/crypto-app`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | No | (same origin) | Full base URL of the API server (production only) |
| `PORT` | No | `3000` | Vite dev server port |
| `API_PORT` | No | `8080` | Local API port for dev proxy |

---

## Admin Panel

The admin login page is intentionally hidden from navigation. Access it at:

```
/admin/secret-login
```

Log in with the password set in `ADMIN_PASSWORD`.

---

## Generating Personalized User Links

From the admin dashboard:
1. Click **Create User**
2. Fill in the user's name, wallet address, eligible balance, and fee details
3. The system auto-generates a unique link: `/u/<slug>`
4. Share that link with the user

---

## Notes

- The `pnpm-workspace.yaml` contains Replit-specific binary overrides that mark many native binaries as `-` (excluded). These are safe to keep outside Replit and reduce install size.
- Replit-specific Vite plugins (`@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`, `@replit/vite-plugin-runtime-error-modal`) are only loaded when the `REPL_ID` environment variable is present, so they have no effect outside Replit.
- Session cookies are set with `secure: true` when `NODE_ENV=production`, so your API server must be served over HTTPS in production (Railway handles this automatically).
