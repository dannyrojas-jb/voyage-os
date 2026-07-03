import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const supabase = createClient();
  const [{ data: clients }, { data: trips }] = await Promise.all([
    supabase.from('clients').select('*').order('created_at', { ascending: false }),
    supabase.from('trips').select('client_id'),
  ]);

  const tripCount = (clientId: string) =>
    (trips ?? []).filter((t: any) => t.client_id === clientId).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Clients</h1>
          <p className="text-sm text-slate-500">Everyone you are planning for. Each agent sees only their own.</p>
        </div>
        <Link href="/clients/new" className="whitespace-nowrap rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white hover:bg-teal/90">+ New client</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {((clients ?? []) as any[]).map((c) => (
          <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-ink">{c.name}</div>
                <div className="text-xs text-slate-400">{c.email ?? 'no email'}</div>
              </div>
              <span className="rounded-full bg-teal/10 px-2.5 py-0.5 text-xs font-semibold text-teal">
                {tripCount(c.id)} {tripCount(c.id) === 1 ? 'trip' : 'trips'}
              </span>
            </div>
            {c.notes && <p className="mt-3 text-sm text-slate-500">{c.notes}</p>}
          </div>
        ))}
        {(clients ?? []).length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
            No clients yet.
          </div>
        )}
      </div>
    </div>
  );
}
