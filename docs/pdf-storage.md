# PDF / Document library (production)

## Architecture

| Piece | Detail |
|-------|--------|
| Storage bucket | `partner-library` (private) |
| Metadata | `library_documents` (+ versions, activity) |
| Staff | `/admin/library` — upload, version, publish, archive, delete |
| Partner | `/portal/documents` — published docs via **signed URL** |
| Auth | Staff: `/admin/login` · Partner: `/login` |

## Cloudflare build env (required)

```text
VITE_SUPABASE_URL=https://twrtfsykittmfrhkjxkn.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public>
```

Without these baked at **build** time, the app cannot open Storage (UI will say Supabase not configured). Redeploy after setting.

## Demo seed

**Removed.** Do not use `staff@partners.3horizons.vn` demo login or “Seed 3 PDF”. Upload real files only.

Cleanup leftovers: Admin → **Settings** → purge demo storage paths.

## Ops

1. Login staff at `/admin/login`
2. Admin → Library → upload PDF + metadata → **publish**
3. Partner login → `/portal/documents` → signed download
