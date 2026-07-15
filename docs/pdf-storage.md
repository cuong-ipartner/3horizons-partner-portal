# PDF Storage — Partner library

## Stack

| Layer | Detail |
|-------|--------|
| Bucket | `partner-library` (private) |
| Metadata | `public.library_documents` |
| Access | Partner: signed URL (1h) · Staff: upload/delete/publish |
| MIME | `application/pdf` · max 25 MB |

## Setup

1. Migration: `supabase/migrations/20260714160000_library_storage.sql`  
   ```bash
   supabase db push
   ```
2. App env: `VITE_DATA_MODE=supabase` + URL + anon key  
3. Auth: staff profile `role` in `partner_manager` / `super_admin` / … (`is_staff`)  
4. Partner login required to list + open PDFs (RLS + storage select)

## Admin

URL: `/admin/library`

- **Upload PDF** — title, tag, file  
- **Seed 3 PDF demo** — generates minimal PDFs client-side and uploads  
- Publish / ẩn / xóa  

Staff demo: `staff@partners.3horizons.vn` / `Demo3H!2026` (tự login từ nút seed/upload).

## Partner

URL: `/portal/documents`

- List `published` rows  
- **Xem PDF** → `createSignedUrl` → iframe + download / open tab  

## Code

| File | Role |
|------|------|
| `src/data/library-store.ts` | list, upload, signed URL, seed, delete |
| `src/lib/pdf.ts` | minimal PDF generator for seed |
| `src/pages/admin/AdminLibrary.tsx` | staff UI |
| `src/pages/portal/PortalPages.tsx` | DocumentsPage |
| `src/components/portal/DocumentPreview.tsx` | iframe viewer |

## Security notes

- Bucket **not public** — always signed URL  
- Staff-only write via `is_staff(auth.uid())`  
- Never put `service_role` in Vite  
- Rotate signed URL expiry as needed (default 3600s)

## Ops

- Replace seed PDFs with brand-designed files via Admin upload  
- Optional: path convention `docs/{slug}-{id}.pdf`  
- Backup: Supabase Storage + table dump with project backups  
