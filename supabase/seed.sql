-- Optional seed for linked Supabase project (demo projects).
-- Run after migration + after creating staff/partner users in Auth.
-- Partner slugs must match profiles.partner_slug for RLS membership checks.

insert into public.partners (slug, name, email, title, region, verified, status)
values
  ('cuong-doan', 'Cuong Doan', 'cuong@example.com', 'Partner', 'Vietnam', true, 'active'),
  ('lan-pham', 'Lan Phạm', 'lan.pham@example.com', 'Corporate Strategy Partner', 'Vietnam', true, 'active'),
  ('erik-sundberg', 'Erik Sundberg', 'erik@example.com', 'Execution Partner', 'APAC', true, 'active'),
  ('david-tran', 'David Trần', 'david@example.com', 'Family Governance', 'Vietnam', true, 'active')
on conflict (slug) do nothing;

insert into public.projects (id, title, status, next_action, due_date, files_count, updates_count)
values
  (
    'col-310',
    'Kích hoạt đối tác 3HVN',
    'active',
    'Xác nhận agenda workshop tuần 21/07',
    '2026-08-30',
    8,
    5
  ),
  (
    'col-221',
    'Chuỗi workshop làm rõ chiến lược',
    'active',
    'Xác nhận agenda workshop tuần 21/07',
    '2026-08-15',
    12,
    8
  ),
  (
    'col-198',
    'Phục hồi thực thi — danh mục số',
    'paused',
    'Tiếp tục sau rà soát ngân sách Q3',
    '2026-09-30',
    6,
    4
  ),
  (
    'col-175',
    'Family council setup',
    'archived',
    'Đã lưu trữ — engagement hoàn tất',
    '2026-04-30',
    20,
    15
  )
on conflict (id) do nothing;

insert into public.project_members (project_id, partner_slug, display_name, role)
values
  ('col-310', 'cuong-doan', 'Cuong Doan', 'partner'),
  ('col-310', 'staff-3h', 'Facilitator 3H', 'facilitator'),
  ('col-221', 'lan-pham', 'Lan Phạm', 'partner'),
  ('col-221', 'staff-3h', 'Facilitator 3H', 'facilitator'),
  ('col-198', 'erik-sundberg', 'Erik Sundberg', 'partner'),
  ('col-175', 'david-tran', 'David Trần', 'partner')
on conflict (project_id, partner_slug) do nothing;

-- Fix facilitator row without partner_slug unique conflict: use distinct display only
-- (unique on partner_slug allows multiple nulls in Postgres)

insert into public.project_milestones (project_id, label, done, due_date, sort_order)
values
  ('col-310', 'Kickoff onboarding', true, '2026-06-01', 1),
  ('col-310', 'Checklist hồ sơ', true, '2026-06-20', 2),
  ('col-310', 'Workshop kích hoạt', false, '2026-07-21', 3),
  ('col-310', 'Bàn giao SOP', false, '2026-08-15', 4),
  ('col-221', 'Discovery call', true, '2026-06-28', 1),
  ('col-221', 'Phỏng vấn lãnh đạo', true, '2026-07-05', 2),
  ('col-221', 'Workshop 1 — lựa chọn', false, '2026-07-21', 3),
  ('col-221', 'Bản chiến lược 1 trang', false, '2026-08-01', 4)
on conflict do nothing;
