-- Voyage OS - upgrade: billing (subscriptions, invoices) + flights (trip_flights).
-- Run after schema.sql. Safe to re-run.

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  plan text not null default 'starter' check (plan in ('starter','pro','agency')),
  status text not null default 'active' check (status in ('trialing','active','past_due','canceled')),
  seats int not null default 1,
  current_period_end date,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  number text not null,
  description text,
  amount numeric(12,2) not null default 0,
  status text not null default 'paid' check (status in ('paid','open','void')),
  issued_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.trip_flights (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  trip_id uuid not null references public.trips (id) on delete cascade,
  origin text not null,
  destination text not null,
  depart_date date,
  airline text,
  cabin text default 'economy',
  price numeric(12,2),
  source text default 'duffel',
  created_at timestamptz not null default now()
);

create index if not exists idx_subscriptions_agent on public.subscriptions (agent_id);
create index if not exists idx_invoices_agent on public.invoices (agent_id);
create index if not exists idx_trip_flights_agent on public.trip_flights (agent_id);
create index if not exists idx_trip_flights_trip on public.trip_flights (trip_id);

alter table public.subscriptions enable row level security;
alter table public.invoices      enable row level security;
alter table public.trip_flights  enable row level security;

drop policy if exists "own subscriptions" on public.subscriptions;
create policy "own subscriptions" on public.subscriptions
  for all using (agent_id = auth.uid()) with check (agent_id = auth.uid());

drop policy if exists "own invoices" on public.invoices;
create policy "own invoices" on public.invoices
  for all using (agent_id = auth.uid()) with check (agent_id = auth.uid());

drop policy if exists "own trip_flights" on public.trip_flights;
create policy "own trip_flights" on public.trip_flights
  for all using (agent_id = auth.uid()) with check (agent_id = auth.uid());
