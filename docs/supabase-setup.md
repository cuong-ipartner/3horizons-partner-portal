# Supabase setup — 3HORIZONS Partner Portal

## Tình trạng hiện tại (2026-07-14)

| Hạng mục | Trạng thái |
|----------|------------|
| Cloud project | **`twrtfsykittmfrhkjxkn`** — `https://twrtfsykittmfrhkjxkn.supabase.co` |
| Link CLI | **Đã link** (`supabase link --project-ref twrtfsykittmfrhkjxkn`) |
| Schema migration | **Đã `db push`** — profiles, partners, projects, project_members, milestones + RLS |
| App env | `apps/web/.env` — `VITE_DATA_MODE=supabase` + URL + anon (gitignored) |
| UI data path | Projects UI **vẫn** có thể dùng localStorage store cho đến khi wire query Supabase |
| Docker local | Không bắt buộc (đã dùng remote) |

---

## Bước 1 — Tạo project trên Supabase Cloud

1. Mở https://supabase.com/dashboard  
2. **New project**  
   - Name: `3horizons-partner-portal`  
   - Region: ưu tiên **Singapore** hoặc **Seoul** (gần VN)  
   - Đặt DB password (lưu password manager)  
3. Project Settings → API:  
   - `Project URL` → `VITE_SUPABASE_URL`  
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`  
   - **service_role** → chỉ server, **không** đưa vào Vite  

---

## Bước 2 — Link repo + push schema

Từ root client:

```bash
cd C:\Users\cuong\AI-Consulting-OS\clients\3horizons-partner-portal

# Login nếu chưa
supabase login

# Link (thay PROJECT_REF)
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

Hoặc: Dashboard → SQL Editor → dán nội dung  
`supabase/migrations/20260714000000_init_partner_portal.sql` → Run.

Seed demo (tuỳ chọn):

```bash
# SQL Editor: chạy supabase/seed.sql
```

---

## Bước 3 — Env app

`apps/web/.env` (local, gitignored):

```env
VITE_DATA_MODE=supabase
VITE_SUPABASE_URL=https://YOUR_REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_SITE_URL=http://localhost:5173
```

Giữ `VITE_DATA_MODE=seed` cho đến khi Auth + UI projects đọc Supabase xong.

---

## Bước 4 — Auth users (manual demo)

1. Authentication → Users → Add user (email)  
2. Table `profiles`: set `role` = `partner_manager` (staff) hoặc `partner`  
3. Set `partner_slug` = `cuong-doan` / `lan-pham` … để khớp `project_members`  
4. Gán `project_members.user_id` = auth user id (hoặc chỉ dựa partner_slug)

---

## Schema chính

| Table | Mục đích |
|-------|----------|
| `profiles` | User + role + `partner_slug` |
| `partners` | Directory đối tác |
| `projects` | Collaboration |
| `project_members` | **ACL** multi-tenant |
| `project_milestones` | Mốc |

RLS: partner chỉ `SELECT` project khi là member; staff full CRUD projects/members.

Chi tiết nghiệp vụ: `docs/partner-projects.md`.

---

## Local Docker (tuỳ chọn)

Cần Docker Desktop running:

```bash
supabase start
# In API URL + anon key from CLI output into .env
supabase db reset   # migration + seed
```

---

## Demo Auth (đã wire UI)

| Persona | Email | Password | Role |
|---------|-------|----------|------|
| Cuong Doan | `cuong.doan@partners.3horizons.vn` | `Demo3H!2026` | partner |
| Lan Phạm | `lan.pham@partners.3horizons.vn` | `Demo3H!2026` | partner |
| Erik | `erik.sundberg@partners.3horizons.vn` | `Demo3H!2026` | partner |
| David | `david.tran@partners.3horizons.vn` | `Demo3H!2026` | partner |
| Staff | `staff@partners.3horizons.vn` | `Demo3H!2026` | partner_manager |

- Login UI: `/login` — bấm persona → sign-in hoặc auto sign-up  
- **Bắt buộc demo:** Dashboard → Authentication → Providers → Email → **tắt Confirm email**  
- Projects: `useProjectsState` đọc Supabase khi đã login; RLS lọc membership  

## Checklist

- [x] Project cloud `twrtfsykittmfrhkjxkn`  
- [x] `supabase link` + `db push`  
- [x] `.env` URL + anon + `VITE_DATA_MODE=supabase`  
- [x] Wire Auth + projects store → Supabase  
- [ ] Tắt Confirm email (Auth settings) nếu signup không có session  
- [ ] (Tuỳ chọn) Invite production users, đổi mật khẩu  

---

## Lưu ý bảo mật

- Không commit `.env` / service_role  
- Anon key + RLS = bắt buộc; không tắt RLS production  
- Matching / Admin API staff-only  
