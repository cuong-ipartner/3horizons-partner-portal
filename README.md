# 3HORIZONS Partner Network

**Slug:** `3horizons-partner-portal`  
**Production domain:** https://partners.3horizons.vn  
**Stack:** React + Vite + Supabase Auth/Postgres/Storage + Cloudflare Pages Functions  

---

## Production mode

This portal is set up for **live operation**:

- Real Supabase Auth login (no demo personas)
- Document library with upload / version / publish / archive
- Admin user lifecycle (invite, suspend, roles, reset password)
- Empty seed data — no fake partners/users/projects in UI

Ops runbook: [docs/production-ops.md](docs/production-ops.md)  
Deploy: [docs/deploy-cloudflare.md](docs/deploy-cloudflare.md)

### Required env (Cloudflare Pages)

**Build:**

```bash
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon>
```

**Functions secrets:**

```bash
SUPABASE_SERVICE_ROLE_KEY=<service_role>
# SUPABASE_URL optional if VITE_SUPABASE_URL is available to Functions
```

### Local

```powershell
cd apps\web
copy .env.example .env   # set VITE_SUPABASE_*
npm install
npm run dev
```

| Page | URL |
|------|-----|
| Public site | http://localhost:5173/ |
| Login | http://localhost:5173/login |
| Partner portal | http://localhost:5173/portal |
| Admin OS | http://localhost:5173/admin |

Accounts are invited by staff (Admin → Users). Taxonomy pages (problems/layers/services) remain as product content; directories for partners/insights/requests start empty until real records exist.

### Build check

```powershell
cd apps\web
npm run build
```

---

## Key docs

| Doc | Path |
|-----|------|
| Production ops | [docs/production-ops.md](docs/production-ops.md) |
| Supabase setup | [docs/supabase-setup.md](docs/supabase-setup.md) |
| Cloudflare deploy | [docs/deploy-cloudflare.md](docs/deploy-cloudflare.md) |
| Architecture | [docs/architecture.md](docs/architecture.md) |

Never commit service-role keys or `.env`.
