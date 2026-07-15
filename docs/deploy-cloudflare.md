# Deploy — Cloudflare Pages + partners.3horizons.vn

**Do this after localhost demo is approved.**  
Confirm with stakeholder before first production deploy.

---

## Prerequisites

1. Cloudflare account with zone `3horizons.vn` (or ability to add CNAME)  
2. Supabase project (when leaving seed mode)  
3. Node 20+  

---

## Local production build check

```powershell
cd C:\Users\cuong\AI-Consulting-OS\clients\3horizons-partner-portal\apps\web
npm install
npm run build
npm run preview
```

Open the preview URL and smoke-test `/`, `/login`, `/portal`, `/problems`.

---

## Cloudflare Pages (Git or direct)

### Option A — Dashboard + Git

| Setting | Value |
|---------|--------|
| Project name | `3horizons-partner-portal` |
| Root directory | `apps/web` (if monorepo root is client folder) or repo root path as applicable |
| Build command | `npm run build` |
| Build output | `dist` |
| Node version | `20` |

**Environment variables (Production):**

| Name | Value |
|------|--------|
| `VITE_DATA_MODE` | `supabase` |
| `VITE_SITE_URL` | `https://partners.3horizons.vn` |
| `VITE_SUPABASE_URL` | from Supabase |
| `VITE_SUPABASE_ANON_KEY` | from Supabase |

### Option B — Wrangler CLI

```powershell
cd apps\web
npm run build
npx wrangler pages deploy dist --project-name=3horizons-partner-portal
```

`wrangler.toml` already sets SPA `not_found_handling`.

**Do not deploy** until user confirms (shared / production impact).

---

## Custom domain

1. Cloudflare Pages → project → Custom domains  
2. Add `partners.3horizons.vn`  
3. DNS: CNAME `partners` → `<project>.pages.dev` (proxied)  
4. Wait for SSL  

---

## Supabase Auth redirect URLs

In Supabase Dashboard → Authentication → URL configuration:

- Site URL: `https://partners.3horizons.vn`  
- Redirect allow list:  
  - `https://partners.3horizons.vn/**`  
  - `http://localhost:5173/**` (dev)  

---

## Smoke checklist (prod)

- [ ] `/` Overview loads  
- [ ] `/login` → `/portal`  
- [ ] Deep link `/portal/documents` refresh works (SPA)  
- [ ] `/problems/succession` works  
- [ ] HTTPS + correct domain  
- [ ] No service-role key in client bundle  

---

## Rollback

Cloudflare Pages keeps prior deployments — roll back from Deployments UI if needed.
