-- Simplified documents module (Admin full / Partner published-only)
-- Table: public.documents · Bucket: documents (private)

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  file_name text not null,
  file_path text not null unique,
  file_size bigint,
  mime_type text,
  tags text[] not null default '{}',
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists documents_status_idx
  on public.documents (status, updated_at desc);

create index if not exists documents_title_idx
  on public.documents using gin (to_tsvector('simple', coalesce(title, '')));

drop trigger if exists documents_updated_at on public.documents;
create trigger documents_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.documents enable row level security;

drop policy if exists documents_select on public.documents;
create policy documents_select on public.documents
  for select to authenticated
  using (
    public.is_staff(auth.uid())
    or (
      status = 'published'
      and exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
          and p.status = 'active'
      )
    )
  );

drop policy if exists documents_insert_staff on public.documents;
create policy documents_insert_staff on public.documents
  for insert to authenticated
  with check (public.is_staff(auth.uid()) and created_by = auth.uid());

drop policy if exists documents_update_staff on public.documents;
create policy documents_update_staff on public.documents
  for update to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

drop policy if exists documents_delete_staff on public.documents;
create policy documents_delete_staff on public.documents
  for delete to authenticated
  using (public.is_staff(auth.uid()));

grant select, insert, update, delete on public.documents to authenticated;

-- ---------------------------------------------------------------------------
-- Storage bucket (private)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  26214400, -- 25 MB
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/png',
    'image/jpeg'
  ]::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Partner: only objects linked to published documents
-- Staff: all objects in bucket
drop policy if exists documents_bucket_select on storage.objects;
create policy documents_bucket_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'documents'
    and (
      public.is_staff(auth.uid())
      or exists (
        select 1 from public.documents d
        where d.file_path = name
          and d.status = 'published'
          and exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.status = 'active'
          )
      )
    )
  );

drop policy if exists documents_bucket_insert on storage.objects;
create policy documents_bucket_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'documents' and public.is_staff(auth.uid()));

drop policy if exists documents_bucket_update on storage.objects;
create policy documents_bucket_update on storage.objects
  for update to authenticated
  using (bucket_id = 'documents' and public.is_staff(auth.uid()))
  with check (bucket_id = 'documents' and public.is_staff(auth.uid()));

drop policy if exists documents_bucket_delete on storage.objects;
create policy documents_bucket_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'documents' and public.is_staff(auth.uid()));
