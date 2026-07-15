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

### ❌ Build fail: Deploy command + wrangler (most common)

Log dạng:
```text
Executing user deploy command: npx wrangler pages deploy dist --project-name=3horizons-partner-portal
ERROR The Pages project "3horizons-partner-portal" does not exist.
```
hoặc:
```text
Executing user deploy command: npx wrangler deploy
ERROR Missing entry-point to Worker script
```

**Nguyên nhân:** Git build **không cần** Deploy command. Cloudflare **tự** upload `dist` sau `npm run build`.  
Lệnh `wrangler pages deploy` trong CI dùng token account build (`a9e53b9b…`) — thường **không** thấy project (khác account / chưa tạo) → fail.

**Sửa ngay (Dashboard)** → project gắn Git → **Settings → Builds**:

| Field | Đúng | Sai |
|-------|------|-----|
| Build command | `npm run build` | — |
| **Deploy command** | **(để trống / empty)** | `npx wrangler pages deploy …` |
| Build output directory | `dist` | — |
| Root directory | `apps/web` | — |

Sau đó **Retry deployment**.

`npx wrangler pages deploy` / `npm run deploy:cf` **chỉ** chạy trên máy local (đã `wrangler login`), **không** đặt vào Deploy command của Git.

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
