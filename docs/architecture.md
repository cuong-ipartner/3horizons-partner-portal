# Architecture — 3HORIZONS Partner Network

**Updated:** 2026-07-14  
**Production URL (target):** https://partners.3horizons.vn  
**Local demo:** http://localhost:5173

---

## Target stack (locked direction)

| Layer | Choice |
|-------|--------|
| Frontend | React + Vite + TypeScript (SPA) |
| Hosting | **Cloudflare Pages** (static SPA + SPA fallback) |
| Domain | `partners.3horizons.vn` (Cloudflare DNS → Pages) |
| Data / Auth | **Supabase** (Postgres + Auth + Storage + RLS) |
| Local demo | Seed data (`VITE_DATA_MODE=seed`) — no Supabase required |

```text
Browser
   │
   ▼
Cloudflare Pages  ── partners.3horizons.vn
   │  (static SPA: apps/web/dist)
   │
   ├── public Partner Network routes
   └── /portal + /login workspace
         │
         ▼  (production)
      Supabase
         ├── Auth (email / Google)
         ├── Postgres (partners, layers, requests, …)
         ├── Storage (docs, case assets)
         └── RLS (partner vs client vs admin)
```

---

## Environments

| Env | URL | Data |
|-----|-----|------|
| **Local demo** | `http://localhost:5173` | Seed (`src/data/seed.ts`) |
| Staging (optional) | Pages preview URL | Supabase project (staging) |
| Production | `https://partners.3horizons.vn` | Supabase production |

Env vars (frontend only — **anon key**, never service role):

```bash
VITE_DATA_MODE=seed|supabase
VITE_SITE_URL=https://partners.3horizons.vn
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

See `apps/web/.env.example`.

---

## App surfaces

| Surface | Routes | Notes |
|---------|--------|-------|
| Partner Network (public) | `/`, `/problems`, `/layers`, `/partners`, `/match`, … | Problem-first discovery |
| Auth | `/login` | Later: Supabase Auth |
| Workspace shell | `/portal/*` | Bizfly-inspired dashboard |

---

## Phased delivery

### Phase 0 — Localhost demo (now)

- [x] UI for network + login + portal shell  
- [x] Seed data  
- [x] `.env` seed mode + wrangler SPA config  
- [ ] Walkthrough on localhost  

### Phase 1 — Supabase schema + seed import

- Tables: `profiles`, `partners`, `layers`, `problems`, `service_lines`, `match_requests`, `collaborations` / `projects`, `project_members`, `documents`  
- RLS policies by role + **project membership** (partner only sees assigned projects)  
- Operating model: see `docs/partner-projects.md`
- Optional Storage buckets for docs  
- Import seed content  

### Phase 2 — Auth + real login

- Email/password and/or Google via Supabase Auth  
- Map user → partner/client role  
- Protect `/portal/*`  

### Phase 3 — Cloudflare Pages + domain

- Create Pages project `3horizons-partner-portal`  
- Build: `apps/web` → `npm run build` → `dist`  
- SPA: `wrangler.toml` `not_found_handling = single-page-application`  
- Custom domain: `partners.3horizons.vn`  
- Set production env vars in Cloudflare  

### Phase 4 — Ops

- Admin review queue for match requests  
- Backups / monitoring  
- Content workflow for partners & insights  

---

## Cloudflare SPA note

Do **not** use Netlify-style `/* /index.html 200` in `_redirects` (Cloudflare rejects infinite loop).  
Use:

- `wrangler.toml` → `not_found_handling = "single-page-application"`  
- and/or Dashboard SPA setting  

---

## Security

- Anon key only in browser  
- Service role only in Edge Functions / server (later)  
- Partner briefs / match context = **confidential**  
- No secrets in git (`.env` gitignored)  

---

## Related

- Deploy runbook: `docs/deploy-cloudflare.md`  
- IA: `docs/information-architecture.md`  
- App README: `apps/web/README.md`  
