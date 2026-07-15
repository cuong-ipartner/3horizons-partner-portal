# Production operations — 3HORIZONS Partner Portal

## Status

Portal is production-oriented:

- **Auth:** Supabase Auth only (no demo personas / local fallback login).
- **Documents:** `library_documents` + Storage `partner-library` with metadata, versions, activity, RBAC.
- **Users:** Admin invite / status / role / reset password via Pages Function + service role.
- **Demo data:** Seed arrays emptied; SQL seed empty; migration cleanup removes seed library rows.

## Required env

### Cloudflare Pages (build — `VITE_*`)

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_ANON_KEY` | Anon key (public) |
| `VITE_DATA_MODE` | Prefer omit or `supabase` (never leave as `seed` if keys exist) |

### Cloudflare Pages (Functions secrets)

| Variable | Purpose |
|----------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Admin invite, ban, cleanup (**required**, Encrypt) |
| `SUPABASE_URL` or `VITE_SUPABASE_URL` | Same project URL for Functions (optional; code falls back to project URL) |

**Important (CF Pages):**

1. Set under project **Settings → Variables and Secrets** for **Production** (and Preview if needed).
2. Use **exact** name: `SUPABASE_SERVICE_ROLE_KEY` (not `SERVICE_ROLE`, not build-only note alone).
3. After adding/changing secrets → **Deployments → Retry deployment** (or push a commit). Runtime may not pick new secrets until redeploy.
4. Verify: open `https://<site>/api/admin/health`  
   - `ok: true` and `resolved_service_role: true` → Functions see the secret  
   - `ok: false` → secret still not visible to Functions
5. CLI alternative (from `apps/web`):
   ```powershell
   npx wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY --project-name=3horizons-partner-portal
   # paste service_role JWT when prompted
   npx wrangler pages secret put SUPABASE_URL --project-name=3horizons-partner-portal
   # paste https://twrtfsykittmfrhkjxkn.supabase.co
   ```

Never put service role in Vite client code.

## First live day

1. Confirm migration `20260715120000_production_os.sql` applied on Supabase.
2. Create first staff user in Supabase Auth → upsert `profiles` with `role = super_admin`, `status = active`.
3. Deploy Pages with build env + Functions secrets.
4. Login `/login` → `/admin`.
5. **Users** → invite real partners/staff.
6. **Library** → upload docs (draft → publish).
7. **Settings** → Archive demo users / purge seed storage if any leftovers.
8. DNS: `partners.3horizons.vn` CNAME → `3horizons-partner-portal.pages.dev`.

## Roles

| Role | Shell |
|------|--------|
| `super_admin`, `partner_manager`, `project_operator`, `content_editor` | `/admin` + can use staff APIs |
| `partner` | `/portal` only |
| suspended / archived | Login blocked |

## Document lifecycle

Upload → draft → publish / unpublish → archive → delete.  
Partner portal lists **published** only (RLS + client filter).  
Signed URLs for download; activity logged where permitted.

## Cleanup

Admin → Settings:

- Archive known demo persona emails
- Purge storage objects under `docs/seed-*`

## Acceptance checklist

- [ ] Real user logs in; demo personas gone from UI
- [ ] Partner cannot open `/admin`
- [ ] Document upload with full metadata works for staff
- [ ] Partner sees only published docs they may access
- [ ] Public partner directory empty until real publish
- [ ] No seed projects/users in admin dashboards
- [ ] Audit log shows invite / upload / status changes
