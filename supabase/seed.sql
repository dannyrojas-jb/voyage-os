-- Voyage OS - demo seed data.
-- PREREQUISITE: create the demo user first (Supabase > Authentication > Users > Add user):
--   email: agent@voyage.demo    password: voyagedemo123    (tick "Auto Confirm User")
-- Then run this whole file in the SQL editor. Safe to re-run (it clears demo rows first).

do $$
declare
  a uuid;
  c_harmon uuid; c_desai uuid; c_westlake uuid;
  t_harmon uuid; t_desai uuid; t_westlake uuid;
begin
  select id into a from auth.users where email = 'agent@voyage.demo';
  if a is null then
    raise exception 'Create the demo user agent@voyage.demo first (Authentication > Users > Add user), then re-run seed.sql.';
  end if;

  delete from public.commissions where agent_id = a;
  delete from public.proposals   where agent_id = a;
  delete from public.trips       where agent_id = a;
  delete from public.clients     where agent_id = a;

  insert into public.profiles (id, full_name, agency_name)
    values (a, 'Alex Rivera', 'Voyage Travel Co.')
    on conflict (id) do update set full_name = excluded.full_name, agency_name = excluded.agency_name;

  insert into public.clients (agent_id, name, email, phone, notes)
    values (a, 'The Harmon Family', 'harmon@example.com', '555-0142', 'Anniversary trip; loves food and culture, mid-luxury budget')
    returning id into c_harmon;
  insert into public.clients (agent_id, name, email, phone, notes)
    values (a, 'Priya & Sam Desai', 'desai@example.com', '555-0198', 'Honeymoon; beach plus a little adventure, sea views a must')
    returning id into c_desai;
  insert into public.clients (agent_id, name, email, phone, notes)
    values (a, 'Westlake Corp Retreat', 'ops@westlake.example', '555-0110', 'Offsite for 24; needs group rates and one big group activity')
    returning id into c_westlake;

  insert into public.trips (agent_id, client_id, destination, start_date, end_date, travelers, budget, status, notes)
    values (a, c_harmon, 'Kyoto & Tokyo, Japan', '2026-10-05', '2026-10-14', 2, 9800, 'planning',
            'Ryokan stay plus food tours; shoulder season, wants a mix of temples and modern city')
    returning id into t_harmon;
  insert into public.trips (agent_id, client_id, destination, start_date, end_date, travelers, budget, status, notes)
    values (a, c_desai, 'Amalfi Coast, Italy', '2026-09-12', '2026-09-20', 2, 7200, 'proposal_sent',
            'Honeymoon; sea-view hotel in Positano, one private boat day, relaxed pace')
    returning id into t_desai;
  insert into public.trips (agent_id, client_id, destination, start_date, end_date, travelers, budget, status, notes)
    values (a, c_westlake, 'Cancun, Mexico', '2026-11-02', '2026-11-06', 24, 42000, 'lead',
            'All-inclusive resort block plus one group excursion; corporate offsite')
    returning id into t_westlake;

  insert into public.proposals (agent_id, trip_id, title, content, status)
    values (a, t_desai, 'Amalfi Coast Honeymoon - 8 Nights',
      E'Prepared for Priya & Sam Desai\nAmalfi Coast, Italy - Sep 12 to 20, 2026 - 2 travelers\n\n'
      || E'THE SHAPE OF THE TRIP\nEight unhurried nights on the Amalfi Coast, anchored in Positano with a sea-view room, one private boat day along the coast, and easy day trips you can take or skip. Built for a honeymoon: relaxed mornings, a few standout experiences, nothing over-scheduled.\n\n'
      || E'DAY 1-4 - POSITANO\nCheck into a sea-view room in the heart of Positano. Slow mornings on the terrace, an evening stroll to Spiaggia Grande, and one long dinner at a cliffside table we will reserve in advance.\n\n'
      || E'DAY 5 - PRIVATE BOAT DAY\nA private skippered boat along the coast toward Capri - swim stops in quiet coves, lunch on the water, back by early evening.\n\n'
      || E'DAY 6-8 - RAVELLO & DEPARTURE\nMove up to Ravello for two quiet nights above the coast - the gardens at Villa Cimbrone, a slower pace - then a private transfer to Naples for departure.\n\n'
      || E'WHAT IS INCLUDED\nEight nights across two hand-picked hotels, the private boat day, all ground transfers, and 24/7 support from your advisor while you travel.\n\n'
      || E'Estimated investment sits within your ~$7,200 target. Final pricing is confirmed once you approve the shape below.',
      'sent')
    returning id into t_desai; -- reuse var slot (id captured but not needed further)

  insert into public.commissions (agent_id, trip_id, amount, rate, status) values
    (a, t_desai, 720, 10, 'pending'),
    (a, t_harmon, 980, 10, 'projected'),
    (a, t_westlake, 4200, 10, 'projected');

  raise notice 'Seed complete for agent@voyage.demo.';
end $$;
