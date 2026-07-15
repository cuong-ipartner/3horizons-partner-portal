-- Standing fields for partner private workspace (Phase C)

alter table public.profiles
  add column if not exists region text,
  add column if not exists focus_layers text,
  add column if not exists verified boolean not null default true,
  add column if not exists standing_status text not null default 'active';

comment on column public.profiles.focus_layers is 'Display string e.g. T1 Chiến lược · T6 Kế thừa';
comment on column public.profiles.standing_status is 'active | onboarding | paused';

-- Demo standing for known partner slugs (when profiles exist)
update public.profiles
set
  region = coalesce(region, 'Việt Nam'),
  focus_layers = coalesce(focus_layers, 'T1 Chiến lược · T6 Kế thừa'),
  verified = true,
  standing_status = coalesce(nullif(standing_status, ''), 'active')
where partner_slug in ('cuong-doan', 'lan-pham', 'erik-sundberg', 'david-tran');

update public.profiles
set
  region = coalesce(region, 'Việt Nam'),
  focus_layers = coalesce(focus_layers, 'T1 · T6 · Operating'),
  verified = true,
  standing_status = 'active'
where partner_slug = 'lan-pham';

update public.profiles
set
  region = coalesce(region, 'APAC'),
  focus_layers = coalesce(focus_layers, 'T4 Thực thi · T1 Chiến lược'),
  verified = true
where partner_slug = 'erik-sundberg';

update public.profiles
set
  region = coalesce(region, 'Việt Nam'),
  focus_layers = coalesce(focus_layers, 'T7 Family governance'),
  verified = true
where partner_slug = 'david-tran';
