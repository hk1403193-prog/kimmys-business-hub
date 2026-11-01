-- Phase 3 practice lock for kimmys-hub-practice only.
-- Run this in that project's SQL editor. Do not run it anywhere else.
-- This does not touch kimmysdelivery.com, customer records, or payments.
-- The app never runs this file and never edits auth.users.

create table if not exists public.practice_owner_notes (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  created_at timestamptz not null default now(),
  constraint practice_owner_notes_fictional check (body like 'FICTIONAL:%'),
  constraint practice_owner_notes_length check (char_length(body) between 10 and 500)
);

comment on table public.practice_owner_notes is
  'Fictional practice notes for the owner lock. Not customer records. Not the live website.';

alter table public.practice_owner_notes enable row level security;
alter table public.practice_owner_notes force row level security;

revoke all on table public.practice_owner_notes from public;
revoke all on table public.practice_owner_notes from anon;
revoke all on table public.practice_owner_notes from authenticated;

grant select, insert, update, delete on table public.practice_owner_notes to authenticated;

create or replace function public.is_verified_owner()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select
    coalesce(auth.jwt() ->> 'role', '') = 'authenticated'
    and coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
    and coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'owner'
$$;

comment on function public.is_verified_owner() is
  'True only for an authenticated owner session that has verified TOTP (aal2).';

revoke all on function public.is_verified_owner() from public;
revoke all on function public.is_verified_owner() from anon;
grant execute on function public.is_verified_owner() to authenticated;

drop policy if exists practice_owner_notes_select on public.practice_owner_notes;
drop policy if exists practice_owner_notes_insert on public.practice_owner_notes;
drop policy if exists practice_owner_notes_update on public.practice_owner_notes;
drop policy if exists practice_owner_notes_delete on public.practice_owner_notes;

create policy practice_owner_notes_select
  on public.practice_owner_notes
  for select
  to authenticated
  using (public.is_verified_owner());

create policy practice_owner_notes_insert
  on public.practice_owner_notes
  for insert
  to authenticated
  with check (
    public.is_verified_owner()
    and body like 'FICTIONAL:%'
  );

create policy practice_owner_notes_update
  on public.practice_owner_notes
  for update
  to authenticated
  using (public.is_verified_owner())
  with check (
    public.is_verified_owner()
    and body like 'FICTIONAL:%'
  );

create policy practice_owner_notes_delete
  on public.practice_owner_notes
  for delete
  to authenticated
  using (public.is_verified_owner());

-- Optional fictional row, for a verified owner to insert later:
-- insert into public.practice_owner_notes (body)
-- values ('FICTIONAL: practice lock check');
