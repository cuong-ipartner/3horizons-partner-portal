-- Partner library: document metadata + private PDF storage bucket

create table if not exists public.library_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tag text not null default 'Nền tảng',
  file_type text not null default 'PDF',
  storage_path text not null unique,
  file_size bigint,
  summary text,
  published boolean not null default true,
  sort_order int not null default 0,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists library_documents_published_idx
  on public.library_documents (published, sort_order, updated_at desc);

drop trigger if exists library_documents_updated_at on public.library_documents;
create trigger library_documents_updated_at
  before update on public.library_documents
  for each row execute function public.set_updated_at();

alter table public.library_documents enable row level security;

-- Partners (authenticated) read published docs
drop policy if exists library_docs_select on public.library_documents;
create policy library_docs_select on public.library_documents
  for select to authenticated
  using (published = true or public.is_staff(auth.uid()));

-- Staff full write
drop policy if exists library_docs_staff_all on public.library_documents;
create policy library_docs_staff_all on public.library_documents
  for all to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

grant select on public.library_documents to authenticated;
grant insert, update, delete on public.library_documents to authenticated;

-- Storage bucket (private)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'partner-library',
  'partner-library',
  false,
  26214400, -- 25 MB
  array['application/pdf']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Authenticated partners can download library PDFs
drop policy if exists partner_library_select on storage.objects;
create policy partner_library_select on storage.objects
  for select to authenticated
  using (bucket_id = 'partner-library');

-- Staff can upload/update/delete
drop policy if exists partner_library_staff_insert on storage.objects;
create policy partner_library_staff_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'partner-library' and public.is_staff(auth.uid()));

drop policy if exists partner_library_staff_update on storage.objects;
create policy partner_library_staff_update on storage.objects
  for update to authenticated
  using (bucket_id = 'partner-library' and public.is_staff(auth.uid()))
  with check (bucket_id = 'partner-library' and public.is_staff(auth.uid()));

drop policy if exists partner_library_staff_delete on storage.objects;
create policy partner_library_staff_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'partner-library' and public.is_staff(auth.uid()));
