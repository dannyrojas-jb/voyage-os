-- Voyage OS - database schema with row-level security.
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query > paste > Run).
-- It is safe to re-run.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  agency_name text default 'Voyage Travel Co.',
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  destination text not null,
  start_date date,
  end_date date,
  travelers int not null default 2,
  budget numeric(12,2),
  status text not null default 'lead'
    check (status in ('lead','planning','proposal_sent','booked','completed')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  trip_id uuid not null references public.trips (id) on delete cascade,
  title text not null,
  content text not null,
  status text not null default 'draft'
    check (status in ('draft','sent','approved','declined')),
  public_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  trip_id uuid not null references public.trips (id) on delete cascade,
  amount numeric(12,2) not null default 0,
  rate numeric(5,2) not null default 10,
  status text not null default 'projected'
    check (status in ('projected','pending','earned')),
  created_at timestamptz not null default now()
);

create index if not exists idx_clients_agent on public.clients (agent_id);
create index if not exists idx_trips_agent on public.trips (agent_id);
create index if not exists idx_proposals_agent on public.proposals (agent_id);
create index if not exists idx_proposals_token on public.proposals (public_token);
create index if not exists idx_commissions_agent on public.commissions (agent_id);

-- ---------------------------------------------------------------------------
-- Row-level security: every agent sees ONLY their own rows.
-- ---------------------------------------------------------------------------

alter table public.profiles    enable row level security;
alter table public.clients     enable row level security;
alter table public.trips       enable row level security;
alter table public.proposals   enable row level security;
alter table public.commissions enable row level security;

-- profiles: a user manages only their own profile row
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- helper macro pattern: owner-only access keyed to auth.uid()
drop policy if exists "own clients" on public.clients;
create policy "own clients" on public.clients
  for all using (agent_id = auth.uid()) with check (agent_id = auth.uid());

drop policy if exists "own trips" on public.trips;
create policy "own trips" on public.trips
  for all using (agent_id = auth.uid()) with check (agent_id = auth.uid());

drop policy if exists "own proposals" on public.proposals;
create policy "own proposals" on public.proposals
  for all using (agent_id = auth.uid()) with check (agent_id = auth.uid());

drop policy if exists "own commissions" on public.commissions;
create policy "own commissions" on public.commissions
  for all using (agent_id = auth.uid()) with check (agent_id = auth.uid());

-- ---------------------------------------------------------------------------
-- New-user trigger: auto-create a profile row on signup.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Travel Agent'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Public client portal: tokenized, read + approve WITHOUT exposing the table.
-- SECURITY DEFINER functions bypass RLS but only for a single row by token,
-- so a prospective client can view/approve their proposal with no login.
-- ---------------------------------------------------------------------------

create or replace function public.get_proposal_by_token(token uuid)
returns table (
  id uuid,
  title text,
  content text,
  status text,
  destination text,
  client_name text,
  agency_name text,
  created_at timestamptz
)
language sql
security definer set search_path = public
as $$
  select p.id, p.title, p.content, p.status,
         t.destination, c.name as client_name,
         coalesce(pr.agency_name, 'Voyage Travel Co.') as agency_name,
         p.created_at
  from public.proposals p
  join public.trips t on t.id = p.trip_id
  join public.clients c on c.id = t.client_id
  left join public.profiles pr on pr.id = p.agent_id
  where p.public_token = token;
$$;

grant execute on function public.get_proposal_by_token(uuid) to anon, authenticated;

create or replace function public.approve_proposal(token uuid)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  new_status text;
begin
  update public.proposals set status = 'approved' where public_token = token;
  update public.trips t set status = 'booked'
    from public.proposals p
    where p.public_token = token and p.trip_id = t.id and t.status <> 'completed';
  select status into new_status from public.proposals where public_token = token;
  return new_status;
end;
$$;

grant execute on function public.approve_proposal(uuid) to anon, authenticated;
