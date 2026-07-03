import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import StatusBadge from '@/components/StatusBadge';
import ProposalBuilder from '@/components/ProposalBuilder';
import { money, dateRange, TRIP_STATUS_LABEL } from '@/lib/format';
import { sendProposal } from './actions';

export const dynamic = 'force-dynamic';

export default async function TripDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: trip } = await supabase
    .from('trips')
    .select('*, clients(name, email, notes)')
    .eq('id', params.id)
    .single();

  if (!trip) notFound();
  const t = trip as any;

  const { data: proposalsRaw } = await supabase
    .from('proposals')
    .select('*')
    .eq('trip_id', params.id)
    .order('created_at', { ascending: false });
  const proposals = (proposalsRaw ?? []) as any[];

  const { data: flightsRaw } = await supabase
    .from('trip_flights')
    .select('*')
    .eq('trip_id', params.id)
    .order('created_at', { ascending: false });
  const flights = (flightsRaw ?? []) as any[];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t.destination}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {t.clients?.name} · {t.travelers} travelers · {dateRange(t.start_date, t.end_date)}
          </p>
        </div>
        <StatusBadge status={t.status} label={TRIP_STATUS_LABEL[t.status]} />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs uppercase tracking-wide text-slate-400">Budget</div>
          <div className="mt-1 text-lg font-bold text-water">{money(t.budget)}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs uppercase tracking-wide text-slate-400">Client</div>
          <div className="mt-1 text-sm font-semibold text-ink">{t.clients?.name}</div>
          <div className="text-xs text-slate-400">{t.clients?.email}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs uppercase tracking-wide text-slate-400">Brief</div>
          <div className="mt-1 text-sm text-slate-600">{t.notes ?? t.clients?.notes ?? '-'}</div>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">AI itinerary builder</h2>
        </div>
        <p className="mb-4 max-w-2xl text-sm text-slate-500">
          Draft a client-ready proposal from this trip&apos;s real details. Claude is instructed to use only the
          facts on file and not invent prices or vendor names, so the draft stays grounded and safe to send.
        </p>
        <ProposalBuilder tripId={t.id} />
      </div>

      {flights.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Flights</h2>
          <div className="space-y-2">
            {flights.map((f) => (
              <div key={f.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
                <span className="font-semibold text-ink">{f.airline}</span>
                <span className="text-slate-500">{f.origin} &rarr; {f.destination}{f.depart_date ? ` · ${f.depart_date}` : ''}</span>
                <span className="ml-auto font-semibold text-water">{money(f.price)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Proposals</h2>
      <div className="space-y-4">
        {proposals.map((p) => {
          const portalUrl = `${siteUrl}/portal/${p.public_token}`;
          return (
            <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-semibold text-ink">{p.title}</div>
                <StatusBadge status={p.status} />
              </div>
              <pre className="mb-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-sand p-4 text-sm text-slate-700">
                {p.content}
              </pre>
              <div className="flex flex-wrap items-center gap-3">
                {p.status === 'draft' && (
                  <form action={sendProposal.bind(null, p.id, t.id)}>
                    <button className="rounded-lg bg-water px-3 py-2 text-sm font-semibold text-white hover:bg-ink">
                      Send to client
                    </button>
                  </form>
                )}
                {p.status !== 'draft' && (
                  <a
                    href={`/portal/${p.public_token}`}
                    target="_blank"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-teal hover:border-teal"
                  >
                    Open client portal ↗
                  </a>
                )}
                <span className="truncate text-xs text-slate-400">{portalUrl}</span>
              </div>
            </div>
          );
        })}
        {proposals.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
            No proposals yet. Generate one above.
          </div>
        )}
      </div>
    </div>
  );
}
