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
| Root directory | `apps/web` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| **Deploy command** | **Để trống** (Pages tự publish `dist`) |
| Node version | `20` (`NODE_VERSION=20`) |
| Functions | Auto from `apps/web/functions/` |

### ❌ Build fail: `npx wrangler deploy` + Missing entry-point

Log dạng:
```text
Executing user deploy command: npx wrangler deploy
It seems that you have run wrangler deploy on a Pages project
ERROR Missing entry-point to Worker script or to assets directory
```

**Nguyên nhân:** Deploy command đang là **Workers** (`wrangler deploy`), không phải **Pages**.

**Sửa trong Cloudflare Dashboard** → project → **Settings** → **Builds**:

| Field | Đúng | Sai |
|-------|------|-----|
| Build command | `npm run build` | — |
| Deploy command | **(empty)** | `npx wrangler deploy` |
| Build output | `dist` | — |

Nếu bắt buộc dùng Wrangler làm deploy command:

```bash
npx wrangler pages deploy dist --project-name=3horizons-partner-portal
```

(hoặc `npm run cf:pages` sau khi build — chỉ khi đã ở `apps/web` và có `dist/`)

### Fix **API error 405** (POST → static asset)

405 = request **không** vào Pages Function (static server không nhận POST).

Checklist:
1. Root directory **phải** là `apps/web` (có thư mục `functions/`).
2. Redeploy sau khi có `public/_routes.json` (include `/api/*`).
3. CLI deploy từ `apps/web` (không chỉ upload `dist` rời functions):
   ```powershell
   cd apps\web
   npm run build
   npx wrangler pages deploy dist --project-name=3horizons-partner-portal
   ```
4. Health check: `GET https://<site>/api/nexus` → JSON `{ ok: true }` (không HTML).
5. `POST /api/nexus` cần secret `XAI_API_KEY` (thiếu key → 503 demo, không phải 405).

**Environment variables (Production + Preview)** — must apply to **Build** (Vite embeds at build time):

| Name | Value |
|------|--------|
| `VITE_DATA_MODE` | `supabase` |
| `VITE_SUPABASE_URL` | `https://twrtfsykittmfrhkjxkn.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → **anon public** (not service_role) |
| `VITE_SITE_URL` | `https://partners.3horizons.vn` (no trailing slash preferred) |

Optional server secrets (Pages Functions, not `VITE_`):

| Name | Value |
|------|--------|
| `XAI_API_KEY` | Nexus live |
| `PROXYCURL_API_KEY` | LinkedIn enrich |

After changing env → **Retry deployment** (rebuild required).

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
