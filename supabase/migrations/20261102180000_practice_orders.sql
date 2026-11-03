-- Phase 3.1 fictional practice orders for kimmys-hub-practice only.
-- Run this in that project's SQL editor after
-- supabase/migrations/20261101120000_practice_owner_lock.sql.
-- This file does not change the practice owner notes table or its policies.
-- This does not touch kimmysdelivery.com, customer records, or payments.
-- The app never runs this file and never edits auth.users.
-- The Supabase secret key stays in the dashboard. It is not used here.

do $practice_orders_guard$
begin
  if to_regprocedure('public.is_verified_owner()') is null then
    raise exception 'Run the practice owner lock SQL first. public.is_verified_owner() is missing.';
  end if;
end
$practice_orders_guard$;

create table if not exists public.practice_orders (
  id text primary key,
  owner_id uuid not null,
  fiction_label text not null,
  customer_label text not null,
  phone_label text not null,
  status text not null,
  closed boolean not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint practice_orders_id check (id ~ '^S-[0-9]{4,6}$'),
  constraint practice_orders_fiction_label check (
    fiction_label like 'FICTIONAL:%'
    and char_length(fiction_label) between 12 and 160
  ),
  constraint practice_orders_customer check (
    char_length(customer_label) between 2 and 80
    and customer_label ~* '(sample|example|preview|fictional|demo|practice|placeholder)'
  ),
  constraint practice_orders_phone check (
    phone_label ~ '^\(555\) [0-9]{3}-[0-9]{4}$'
  ),
  constraint practice_orders_status check (
    status in (
      'New',
      'Quoted',
      'Awaiting Payment',
      'Confirmed',
      'Shopping',
      'Picked Up',
      'Out for Delivery',
      'Delivered',
      'Completed',
      'Canceled'
    )
  ),
  constraint practice_orders_closed_matches_status check (
    closed = (status in ('Completed', 'Canceled'))
  ),
  constraint practice_orders_fictional_payload check (
    jsonb_typeof(payload) = 'object'
    and octet_length(payload::text) <= 12000
    and payload->>'fiction' = 'practice'
    and payload->>'id' = id
    and payload->>'customer' = customer_label
    and payload->>'phone' = phone_label
    and payload->>'status' = status
    and payload->>'priority' in ('Low', 'Normal', 'High')
    and payload->>'requestedDate' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    and payload->>'deliveryWindow' in (
      'Morning',
      '12:00–1:00 PM',
      '1:00–3:00 PM',
      '2:00–4:00 PM',
      '3:00–5:00 PM',
      'Evening'
    )
    and payload->>'pickupWindow' in (
      'Morning',
      '12:00–1:00 PM',
      '1:00–3:00 PM',
      '2:00–4:00 PM',
      '3:00–5:00 PM',
      'Evening'
    )
    and coalesce(payload->>'customer', '') ~* '(sample|example|preview|fictional|demo|practice|placeholder)'
    and coalesce(payload->>'area', '') ~* '(practice|sample|demo|preview|fictional|placeholder)'
    and coalesce(payload->>'address', '') ~* '(practice|sample|demo|preview|fictional|placeholder)'
    and coalesce(payload->>'pickupPlace', '') ~* '(practice|sample|demo|preview|fictional|placeholder)'
    and coalesce(payload->>'deliveryPlace', '') ~* '(practice|sample|demo|preview|fictional|placeholder)'
    and (
      coalesce(payload->>'instructions', '') = ''
      or payload->>'instructions' ~* 'fictional'
    )
    and payload::text !~* 'kimmysdelivery'
    and position('@' in payload::text) = 0
  )
);

comment on table public.practice_orders is
  'Fictional practice orders for the verified owner. Not customer records. Not the live website.';

alter table public.practice_orders enable row level security;
alter table public.practice_orders force row level security;

revoke all on table public.practice_orders from public;
revoke all on table public.practice_orders from anon;
revoke all on table public.practice_orders from authenticated;

grant select, insert, update on table public.practice_orders to authenticated;

drop policy if exists practice_orders_select on public.practice_orders;
drop policy if exists practice_orders_insert on public.practice_orders;
drop policy if exists practice_orders_update on public.practice_orders;

create policy practice_orders_select
  on public.practice_orders
  for select
  to authenticated
  using (
    public.is_verified_owner()
    and owner_id = auth.uid()
  );

create policy practice_orders_insert
  on public.practice_orders
  for insert
  to authenticated
  with check (
    public.is_verified_owner()
    and owner_id = auth.uid()
    and fiction_label like 'FICTIONAL:%'
  );

create policy practice_orders_update
  on public.practice_orders
  for update
  to authenticated
  using (
    public.is_verified_owner()
    and owner_id = auth.uid()
  )
  with check (
    public.is_verified_owner()
    and owner_id = auth.uid()
    and fiction_label like 'FICTIONAL:%'
  );
