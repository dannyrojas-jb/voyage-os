import { createClient } from '@/lib/supabase/server';
import ApproveButton from './ApproveButton';

export const dynamic = 'force-dynamic';

export default async function PortalPage({ params }: { params: { token: string } }) {
  const supabase = createClient();
  const { data } = await supabase.rpc('get_proposal_by_token', { token: params.token });
  const p = (Array.isArray(data) ? data[0] : data) as any;

  if (!p) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand px-4">
        <div className="rounded-2xl bg-white p-8 text-center shadow">
          <div className="text-lg font-semibold text-ink">Proposal not found</div>
          <p className="mt-1 text-sm text-slate-500">This link may have expired. Please check with your travel advisor.</p>
        </div>
      </div>
    );
  }

  const approved = p.status === 'approved';

  return (
    <div className="min-h-screen bg-sand">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-6 py-4">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-teal text-sm font-bold text-white">V</div>
          <div>
            <div className="text-sm font-bold text-ink">{p.agency_name}</div>
            <div className="text-xs text-slate-400">Trip proposal for {p.client_name}</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-teal">{p.destination}</div>
          <h1 className="mb-6 text-2xl font-bold text-ink">{p.title}</h1>
          <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-slate-700">
            {p.content}
          </pre>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-center">
          {approved ? (
            <div>
              <div className="text-lg font-semibold text-emerald-700">This itinerary is approved</div>
              <p className="mt-1 text-sm text-slate-500">
                Thanks! Your advisor has been notified and will confirm the details.
              </p>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-sm text-slate-500">
                Happy with the shape of this trip? Approve it and your advisor will lock in the details.
              </p>
              <ApproveButton token={params.token} />
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Powered by Voyage OS · a TruePulse OS demo
        </p>
      </main>
    </div>
  );
}
