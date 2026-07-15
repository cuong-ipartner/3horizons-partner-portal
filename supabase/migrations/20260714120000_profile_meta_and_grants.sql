-- Allow signup metadata to populate partner_slug / role on profiles
-- Grant authenticated API access (PostgREST)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role text;
  resolved_role public.app_role;
  slug text;
begin
  meta_role := coalesce(new.raw_user_meta_data->>'role', 'partner');
  begin
    resolved_role := meta_role::public.app_role;
  exception when others then
    resolved_role := 'partner';
  end;

  slug := nullif(trim(coalesce(new.raw_user_meta_data->>'partner_slug', '')), '');

  insert into public.profiles (id, email, full_name, initials, role, partner_slug)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      split_part(coalesce(new.email, 'user'), '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data->>'initials',
      upper(left(coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, 'U'), '@', 1)), 2))
    ),
    resolved_role,
    slug
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    initials = coalesce(excluded.initials, public.profiles.initials),
    role = case
      when public.profiles.role = 'partner' and excluded.role is distinct from 'partner'
        then excluded.role
      else public.profiles.role
    end,
    partner_slug = coalesce(public.profiles.partner_slug, excluded.partner_slug),
    updated_at = now();

  return new;
end;
$$;

-- Authenticated users may set own profile fields
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_staff(auth.uid()))
  with check (id = auth.uid() or public.is_staff(auth.uid()));

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (id = auth.uid() or public.is_staff(auth.uid()));

-- Table grants for PostgREST (RLS still applies)
grant usage on schema public to anon, authenticated;
grant select on public.partners to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.project_members to authenticated;
grant select, insert, update, delete on public.project_milestones to authenticated;
