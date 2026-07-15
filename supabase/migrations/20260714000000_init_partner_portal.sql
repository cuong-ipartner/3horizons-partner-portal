-- 3HORIZONS Partner Portal — initial schema
-- Projects multi-tenant: project_members + RLS
-- Apply: supabase db push  (linked)  OR  paste in SQL Editor

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.app_role as enum (
    'super_admin',
    'partner_manager',
    'project_operator',
    'content_editor',
    'partner',
    'client'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.project_status as enum ('active', 'paused', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.member_role as enum ('partner', 'facilitator', 'client', 'owner');
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Profiles (1:1 auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  initials text,
  role public.app_role not null default 'partner',
  partner_slug text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_partner_slug_idx on public.profiles (partner_slug);
create index if not exists profiles_role_idx on public.profiles (role);

-- ---------------------------------------------------------------------------
-- Partners (directory / org identity)
-- ---------------------------------------------------------------------------
create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  email text,
  title text,
  region text,
  verified boolean not null default false,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Projects (collaborations)
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id text primary key,
  title text not null,
  status public.project_status not null default 'active',
  next_action text,
  due_date date,
  files_count int not null default 0,
  updates_count int not null default 0,
  request_id text,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_status_idx on public.projects (status);

-- ---------------------------------------------------------------------------
-- Project members (ACL)
-- ---------------------------------------------------------------------------
create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id text not null references public.projects (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  partner_slug text,
  display_name text not null,
  role public.member_role not null default 'partner',
  created_at timestamptz not null default now(),
  unique (project_id, user_id),
  unique (project_id, partner_slug)
);

create index if not exists project_members_user_idx on public.project_members (user_id);
create index if not exists project_members_partner_slug_idx on public.project_members (partner_slug);
create index if not exists project_members_project_idx on public.project_members (project_id);

-- ---------------------------------------------------------------------------
-- Milestones
-- ---------------------------------------------------------------------------
create table if not exists public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id text not null references public.projects (id) on delete cascade,
  label text not null,
  done boolean not null default false,
  due_date date,
  sort_order int not null default 0
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
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
      and p.role in (
        'super_admin',
        'partner_manager',
        'project_operator',
        'content_editor'
      )
  );
$$;

create or replace function public.is_project_member(pid text, uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.project_members m
    left join public.profiles pr on pr.id = uid
    where m.project_id = pid
      and (
        m.user_id = uid
        or (pr.partner_slug is not null and m.partner_slug = pr.partner_slug)
      )
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists partners_updated_at on public.partners;
create trigger partners_updated_at
  before update on public.partners
  for each row execute function public.set_updated_at();

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- Auto profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'partner')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.partners enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.project_milestones enable row level security;

-- Profiles
drop policy if exists profiles_select_own_or_staff on public.profiles;
create policy profiles_select_own_or_staff on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_staff(auth.uid()));

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_staff(auth.uid()));

-- Partners directory (verified public list can be expanded later)
drop policy if exists partners_select_authenticated on public.partners;
create policy partners_select_authenticated on public.partners
  for select to authenticated
  using (true);

drop policy if exists partners_staff_write on public.partners;
create policy partners_staff_write on public.partners
  for all to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- Projects: member or staff; staff full write
drop policy if exists projects_select_member_or_staff on public.projects;
create policy projects_select_member_or_staff on public.projects
  for select to authenticated
  using (
    public.is_staff(auth.uid())
    or public.is_project_member(id, auth.uid())
  );

drop policy if exists projects_staff_insert on public.projects;
create policy projects_staff_insert on public.projects
  for insert to authenticated
  with check (public.is_staff(auth.uid()));

drop policy if exists projects_staff_update on public.projects;
create policy projects_staff_update on public.projects
  for update to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

drop policy if exists projects_staff_delete on public.projects;
create policy projects_staff_delete on public.projects
  for delete to authenticated
  using (public.is_staff(auth.uid()));

-- Project members
drop policy if exists project_members_select on public.project_members;
create policy project_members_select on public.project_members
  for select to authenticated
  using (
    public.is_staff(auth.uid())
    or public.is_project_member(project_id, auth.uid())
  );

drop policy if exists project_members_staff_write on public.project_members;
create policy project_members_staff_write on public.project_members
  for all to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- Milestones
drop policy if exists milestones_select on public.project_milestones;
create policy milestones_select on public.project_milestones
  for select to authenticated
  using (
    public.is_staff(auth.uid())
    or public.is_project_member(project_id, auth.uid())
  );

drop policy if exists milestones_staff_write on public.project_milestones;
create policy milestones_staff_write on public.project_milestones
  for all to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));
