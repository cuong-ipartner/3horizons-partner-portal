-- App-wide settings (admin toggles). Authenticated users can read; staff can write.

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default 'null'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

-- Default: Grok live API ON (admin can turn off)
insert into public.app_settings (key, value)
values ('nexus_grok_enabled', 'true'::jsonb)
on conflict (key) do nothing;

alter table public.app_settings enable row level security;

drop policy if exists app_settings_select on public.app_settings;
create policy app_settings_select on public.app_settings
  for select to authenticated
  using (true);

drop policy if exists app_settings_staff_write on public.app_settings;
create policy app_settings_staff_write on public.app_settings
  for all to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

grant select on public.app_settings to authenticated;
grant insert, update, delete on public.app_settings to authenticated;
