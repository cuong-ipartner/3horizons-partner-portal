# 3HORIZONS Partner Network

**Slug:** `3horizons-partner-portal`  
**Target production:** https://partners.3horizons.vn  
**Data:** Supabase (later) · **Host:** Cloudflare Pages (later)  
**Now:** localhost demo with seed data  

---

## Localhost demo (start here)

```powershell
cd C:\Users\cuong\AI-Consulting-OS\clients\3horizons-partner-portal\apps\web
npm install
npm run dev
```

Open:

| Page | URL |
|------|-----|
| Partner Network | http://localhost:5173/ |
| Login | http://localhost:5173/login |
| Portal dashboard | http://localhost:5173/portal |

**Sign in:** any email + password (or Google button) → enters portal (UI demo, no real auth yet).

Yellow banner = **seed mode** (no Supabase connected).

---

## Roadmap to production

```text
1. Localhost demo (UI + seed)     ← you are here
2. Supabase project + schema + RLS
3. Wire Auth + replace seed reads
4. Cloudflare Pages deploy
5. Domain partners.3horizons.vn
```

| Doc | Path |
|-----|------|
| Architecture | [docs/architecture.md](docs/architecture.md) |
| Cloudflare deploy | [docs/deploy-cloudflare.md](docs/deploy-cloudflare.md) |
| Information architecture | [docs/information-architecture.md](docs/information-architecture.md) |
| Status | [docs/status.md](docs/status.md) |

---

## Env

Copy `apps/web/.env.example` → `apps/web/.env` (already set for seed demo).

```bash
VITE_DATA_MODE=seed
VITE_SITE_URL=http://localhost:5173
# Later:
# VITE_DATA_MODE=supabase
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
```

Never commit real keys. `.env` is gitignored.

---

## Production build (local check)

```powershell
cd apps\web
npm run build
npm run preview
```

Deploy to Cloudflare only after confirmation — see `docs/deploy-cloudflare.md`.
