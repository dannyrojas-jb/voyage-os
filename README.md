# Voyage OS

A working demo of a **travel-agency operations platform**, built to show a real, coded product on a modern stack. Built by **TruePulse OS** as a portfolio sample.

> This is a demo/sample product, not a live client business. The data is fictional.

## What it does

- **Auth + multi-tenant data isolation** - agents sign in; Postgres **row-level security** guarantees each agent sees only their own clients, trips, proposals, and commissions.
- **CRM** - clients and a live trip pipeline (lead → planning → proposal sent → booked).
- **AI itinerary builder** - generates a client-ready proposal from a trip's real details using the **Claude API**, grounded so it uses only the facts on file and does not invent prices or vendors. Runs server-side; the key is never exposed to the browser.
- **Client portal** - a public, tokenized link where the client reviews the proposal and clicks **Approve** (no login), which books the trip. Access is via a `SECURITY DEFINER` function, so the underlying tables stay locked by RLS.
- **Commission tracking** - projected → pending → earned, with totals.
- **Billing / subscriptions** - a Starter/Pro/Agency plan picker and an invoices list. Payments run through Stripe (test mode) in production; in this demo, switching a plan writes directly to the `subscriptions` table so the flow is fully interactive without live payment keys.
- **Flights (Duffel)** - flight search on a trip. Uses the Duffel API when `DUFFEL_TOKEN` is set and IATA airport codes are given; otherwise it falls back to deterministic sample offers so the demo always works without a key.

## Stack

Next.js 14 (App Router, TypeScript) · Supabase (Postgres + Auth + RLS) · Claude API · Tailwind CSS · deploys on Vercel.

## Live demo

- App: sign in with the pre-filled demo account (`agent@voyage.demo`).
- Client portal: open any trip with a sent proposal and click **Open client portal** to see the client-facing approve flow.

---

## Deploy it yourself (about 15 minutes)

You need three free accounts: **Supabase**, **Anthropic** (for the Claude API - pay per use, a few cents for the demo), and **Vercel**. Claude Code prepared all the code; these steps involve accounts and keys, so you run them.

### 1. Supabase (database + auth)
1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query** → paste all of [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
3. **Authentication → Users → Add user**: email `agent@voyage.demo`, password `voyagedemo123`, tick **Auto Confirm User**.
4. **SQL Editor → New query** → paste all of [`supabase/seed.sql`](supabase/seed.sql) → **Run**.
5. **SQL Editor → New query** → paste all of [`supabase/upgrade.sql`](supabase/upgrade.sql) → **Run**. This adds the billing (`subscriptions`, `invoices`) and flights (`trip_flights`) tables used by the Billing and Flights pages. Safe to re-run.
6. **Project Settings → API**: copy the **Project URL** and the **anon public** key.

### 2. Anthropic (the AI builder)
1. Create a key at [console.anthropic.com](https://console.anthropic.com) → **API Keys**.
2. Copy it (starts with `sk-ant-`). Keep it secret - it goes in Vercel only, never in the code.

> The app runs without this key (the itinerary builder falls back to a clearly-labeled sample draft). Add the key to get real Claude-generated proposals.

### 3. Vercel (hosting)
1. Push this repo to GitHub (already done if Claude Code pushed it for you).
2. At [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. Add **Environment Variables**:
   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon public key |
   | `ANTHROPIC_API_KEY` | your `sk-ant-...` key |
   | `ANTHROPIC_MODEL` | `claude-sonnet-4-6` |
   | `NEXT_PUBLIC_SITE_URL` | your Vercel URL, e.g. `https://voyage-os.vercel.app` |
   | `DUFFEL_TOKEN` | optional - your token from [duffel.com](https://duffel.com) API tokens, for live flight search |
4. **Deploy**. When it is live, set `NEXT_PUBLIC_SITE_URL` to the real URL and redeploy so the client-portal links are correct.

> The app runs without `DUFFEL_TOKEN` (flight search falls back to deterministic sample offers). Add the token to get real Duffel-sourced offers. Billing uses Stripe only in production; this demo's Billing page updates the subscription directly, so no Stripe keys are required to try it.

### Run locally instead
```bash
npm install
cp .env.example .env.local   # fill in the same values as above
npm run dev                  # http://localhost:3000
```

## Security notes
- Row-level security is enabled on every table; policies key every row to `auth.uid()`.
- The public portal never queries tables directly - it calls `get_proposal_by_token` / `approve_proposal` (`SECURITY DEFINER`), which only ever touch the single row matching the token.
- The Anthropic key is read only in a server route; it is never sent to the browser.

---

Built by **TruePulse OS**. Systems over folklore.
