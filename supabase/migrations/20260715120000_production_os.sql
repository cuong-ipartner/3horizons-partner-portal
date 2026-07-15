-- Production OS: documents metadata/versioning, user lifecycle, audit, cleanup helpers

-- ---------------------------------------------------------------------------
-- Profiles lifecycle
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.user_status as enum ('invited', 'active', 'suspended', 'archived');
exception when duplicate_object then null;
end $$;

alter table public.profiles
  add column if not exists status public.user_status not null default 'active',
  add column if not exists invited_by uuid references auth.users (id),
  add column if not exists invited_at timestamptz,
  add column if not exists last_login_at timestamptz,
  add column if not exists notes text;

create index if not exists profiles_status_idx on public.profiles (status);
create index if not exists profiles_role_idx2 on public.profiles (role);

-- ---------------------------------------------------------------------------
-- Library documents — full production metadata
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.doc_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.doc_access as enum ('public', 'authenticated', 'partner', 'staff');
exception when duplicate_object then null;
end $$;

alter table public.library_documents
  add column if not exists doc_type text not null default 'PDF',
  add column if not exists ecosystem_layer text,
  add column if not exists service_line text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists version text not null default '1.0',
  add column if not exists version_number int not null default 1,
  add column if not exists status public.doc_status not null default 'draft',
  add column if not exists access_level public.doc_access not null default 'partner',
  add column if not exists owner_id uuid references auth.users (id),
  add column if not exists owner_name text,
  add column if not exists archived_at timestamptz,
  add column if not exists download_count int not null default 0;

-- Backfill status from published boolean
update public.library_documents
set status = case when published then 'published'::public.doc_status else 'draft'::public.doc_status end
where status = 'draft' and published = true;

create table if not exists public.library_document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.library_documents (id) on delete cascade,
  version text not null,
  version_number int not null,
  storage_path text not null,
  file_size bigint,
  notes text,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create index if not exists library_doc_versions_doc_idx
  on public.library_document_versions (document_id, version_number desc);

create table if not exists public.library_activity (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.library_documents (id) on delete set null,
  actor_id uuid references auth.users (id),
  actor_email text,
  action text not null,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists library_activity_doc_idx on public.library_activity (document_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Audit log (admin)
-- ---------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id),
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id text,
  meta jsonb not null default '{}',
  ip text,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.current_profile_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid
      and p.status = 'active'
      and p.role in (
        'super_admin',
        'partner_manager',
        'project_operator',
        'content_editor'
      )
  );
$$;

create or replace function public.can_read_document(doc public.library_documents)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    case
      when public.is_staff(auth.uid()) then true
      when doc.status <> 'published' then false
      when doc.access_level = 'public' then true
      when doc.access_level = 'authenticated' and auth.uid() is not null then true
      when doc.access_level in ('partner', 'staff') and exists (
        select 1 from public.profiles pr
        where pr.id = auth.uid()
          and pr.status = 'active'
          and (
            pr.role = 'partner'
            or pr.role in ('super_admin','partner_manager','project_operator','content_editor')
          )
      ) then true
      else false
    end;
$$;

-- ---------------------------------------------------------------------------
-- RLS policies refresh
-- ---------------------------------------------------------------------------
alter table public.library_document_versions enable row level security;
alter table public.library_activity enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists library_docs_select on public.library_documents;
create policy library_docs_select on public.library_documents
  for select to authenticated
  using (public.can_read_document(library_documents.*) or public.is_staff(auth.uid()));

drop policy if exists library_docs_staff_all on public.library_documents;
create policy library_docs_staff_all on public.library_documents
  for all to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

drop policy if exists library_versions_select on public.library_document_versions;
create policy library_versions_select on public.library_document_versions
  for select to authenticated
  using (
    public.is_staff(auth.uid())
    or exists (
      select 1 from public.library_documents d
      where d.id = document_id and public.can_read_document(d)
    )
  );

drop policy if exists library_versions_staff on public.library_document_versions;
create policy library_versions_staff on public.library_document_versions
  for all to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

drop policy if exists library_activity_select on public.library_activity;
create policy library_activity_select on public.library_activity
  for select to authenticated
  using (public.is_staff(auth.uid()) or actor_id = auth.uid());

drop policy if exists library_activity_insert on public.library_activity;
create policy library_activity_insert on public.library_activity
  for insert to authenticated
  with check (auth.uid() is not null);

drop policy if exists audit_logs_staff_select on public.audit_logs;
create policy audit_logs_staff_select on public.audit_logs
  for select to authenticated
  using (public.is_staff(auth.uid()));

drop policy if exists audit_logs_staff_insert on public.audit_logs;
create policy audit_logs_staff_insert on public.audit_logs
  for insert to authenticated
  with check (public.is_staff(auth.uid()) or auth.uid() is not null);

-- Profiles: staff can list all; users read own
drop policy if exists profiles_select_own_or_staff on public.profiles;
create policy profiles_select_own_or_staff on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_staff(auth.uid()));

drop policy if exists profiles_staff_update on public.profiles;
create policy profiles_staff_update on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_staff(auth.uid()))
  with check (id = auth.uid() or public.is_staff(auth.uid()));

grant select, insert, update, delete on public.library_document_versions to authenticated;
grant select, insert on public.library_activity to authenticated;
grant select, insert on public.audit_logs to authenticated;

-- ---------------------------------------------------------------------------
-- Production cleanup: remove demo library seed rows (safe re-run)
-- ---------------------------------------------------------------------------
delete from public.library_activity
where document_id in (
  select id from public.library_documents
  where storage_path like 'docs/seed-%'
     or title ilike '%demo%'
     or title ilike '%Bo tai lieu nen%'
     or title ilike '%Brief AI cho HDQT%'
);

delete from public.library_document_versions
where document_id in (
  select id from public.library_documents
  where storage_path like 'docs/seed-%'
);

delete from public.library_documents
where storage_path like 'docs/seed-%'
   or title ilike '%demo%'
   or title ilike 'Bo tai lieu nen%'
   or title ilike 'SOP: Dieu phoi%'
   or title ilike 'Brief AI cho HDQT%';

-- Keep storage objects cleanup to admin job / API (service role)
