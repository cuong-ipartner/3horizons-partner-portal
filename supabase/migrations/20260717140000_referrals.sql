-- Referral Lead module: partners submit leads; staff manage pipeline

-- ---------------------------------------------------------------------------
-- Sequence for REF-YYYY-XXXX
-- ---------------------------------------------------------------------------
create sequence if not exists public.referral_code_seq;

create or replace function public.next_referral_code()
returns text
language plpgsql
as $$
declare
  n int;
begin
  n := nextval('public.referral_code_seq');
  return 'REF-' || to_char(now() at time zone 'UTC', 'YYYY') || '-' || lpad((n % 10000)::text, 4, '0');
end;
$$;

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referral_code text not null unique,
  referrer_user_id uuid not null references auth.users (id),
  referrer_organization text,
  receiving_entity text not null
    check (receiving_entity in ('3hvn', 'wamexm')),
  customer_type text not null
    check (customer_type in ('individual', 'business')),
  customer_name text not null,
  contact_name text not null,
  contact_title text,
  contact_email text,
  contact_phone text not null,
  location text,
  industry text,
  estimated_size text,
  service_need text not null,
  readiness text not null
    check (readiness in ('exploring', 'considering', 'ready_to_meet')),
  preferred_contact_time text,
  notes text,
  customer_consent boolean not null default false
    check (customer_consent = true),
  status text not null default 'pending'
    check (status in (
      'pending', 'accepted', 'rejected', 'contacted',
      'qualified', 'converted', 'closed'
    )),
  rejection_reason text,
  assigned_to uuid references auth.users (id),
  reviewed_by uuid references auth.users (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists referrals_referrer_idx
  on public.referrals (referrer_user_id, created_at desc);
create index if not exists referrals_status_idx
  on public.referrals (status, created_at desc);
create index if not exists referrals_entity_idx
  on public.referrals (receiving_entity);
create index if not exists referrals_code_idx
  on public.referrals (referral_code);

drop trigger if exists referrals_updated_at on public.referrals;
create trigger referrals_updated_at
  before update on public.referrals
  for each row execute function public.set_updated_at();

-- Auto code on insert
create or replace function public.referrals_set_code()
returns trigger
language plpgsql
as $$
begin
  if new.referral_code is null or new.referral_code = '' then
    new.referral_code := public.next_referral_code();
  end if;
  return new;
end;
$$;

drop trigger if exists referrals_set_code_trg on public.referrals;
create trigger referrals_set_code_trg
  before insert on public.referrals
  for each row execute function public.referrals_set_code();

-- ---------------------------------------------------------------------------
-- History / audit for status & assignment
-- ---------------------------------------------------------------------------
create table if not exists public.referral_events (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references public.referrals (id) on delete cascade,
  actor_id uuid references auth.users (id),
  actor_email text,
  event_type text not null,
  from_status text,
  to_status text,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists referral_events_ref_idx
  on public.referral_events (referral_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.referrals enable row level security;
alter table public.referral_events enable row level security;

-- Partner: select own only
drop policy if exists referrals_select on public.referrals;
create policy referrals_select on public.referrals
  for select to authenticated
  using (
    public.is_staff(auth.uid())
    or referrer_user_id = auth.uid()
  );

-- Partner insert: must set self as referrer; status pending
drop policy if exists referrals_insert_partner on public.referrals;
create policy referrals_insert_partner on public.referrals
  for insert to authenticated
  with check (
    referrer_user_id = auth.uid()
    and status = 'pending'
    and customer_consent = true
    and (
      public.is_staff(auth.uid())
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.status = 'active'
      )
    )
  );

-- Partner cannot update after submit (no update policy for partners)
-- Staff full update
drop policy if exists referrals_update_staff on public.referrals;
create policy referrals_update_staff on public.referrals
  for update to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- No delete for partners; staff may delete if needed
drop policy if exists referrals_delete_staff on public.referrals;
create policy referrals_delete_staff on public.referrals
  for delete to authenticated
  using (public.is_staff(auth.uid()));

-- Events: staff all; partner read events for own referrals
drop policy if exists referral_events_select on public.referral_events;
create policy referral_events_select on public.referral_events
  for select to authenticated
  using (
    public.is_staff(auth.uid())
    or exists (
      select 1 from public.referrals r
      where r.id = referral_id and r.referrer_user_id = auth.uid()
    )
  );

drop policy if exists referral_events_insert_staff on public.referral_events;
create policy referral_events_insert_staff on public.referral_events
  for insert to authenticated
  with check (public.is_staff(auth.uid()) or actor_id = auth.uid());

grant select, insert, update, delete on public.referrals to authenticated;
grant select, insert on public.referral_events to authenticated;
grant usage, select on sequence public.referral_code_seq to authenticated;
