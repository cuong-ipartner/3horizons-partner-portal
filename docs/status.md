# Status — 3HORIZONS Partner Network

**Updated:** 2026-07-14

## Target

- **Domain:** https://partners.3horizons.vn  
- **Host:** Cloudflare Pages  
- **Data:** Supabase  
- **Now:** localhost seed demo  

## Done

- Full Partner Network UI + login + portal shell  
- Seed data mode (`VITE_DATA_MODE=seed`)  
- Config stub for Supabase + demo banner  
- `wrangler.toml` SPA for Cloudflare Pages  
- Architecture + deploy runbook  
- `.env.example` / local `.env` (seed)  
- `.gitignore` for secrets and `dist`  
- **Admin Management Portal** `/admin` (operating center):
  users, partners approval, match queue, projects, content, roles, audit  
- Homepage content editor `/portal/admin`  
- UI Việt hoá (login + portal + admin)  
- Partner portal **không** có matching (`/match` chỉ client/desk)  
- **Projects multi-tenant demo:** membership filter + Admin tạo/gán partner  
  (`projects-store`, session personas, `docs/partner-projects.md`)  
- **Supabase cloud linked:** ref `twrtfsykittmfrhkjxkn`  
  — URL `https://twrtfsykittmfrhkjxkn.supabase.co`  
  — migration + RLS pushed; env in `apps/web/.env` (gitignored)  
  — setup: `docs/supabase-setup.md`  

## Doing

- Executive portal Phase A–C (private workspace UX)  

- **PDF Storage:** bucket `partner-library` + `library_documents` + Admin `/admin/library` + portal signed URL viewer (`docs/pdf-storage.md`)

## Next

1. Route guard `/portal` bắt login Supabase  
2. Seed PDF (Admin Library → Seed 3 PDF demo) sau khi staff auth OK  
3. Deploy Cloudflare Pages → `partners.3horizons.vn` (confirm before deploy)  

## Need from client

- Cloudflare access for `3horizons.vn`  
- Supabase project owner / region preference  
- Google OAuth client (if Google sign-in in prod)  
- Final partner seed list  

## Risks

- Deploying without RLS = data leak  
- SPA deep links need CF SPA setting (configured in wrangler)  
