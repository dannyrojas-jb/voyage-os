import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import StatusBadge from '@/components/StatusBadge';
import { money, dateRange, TRIP_STATUS_LABEL } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function TripsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('trips')
    .select('*, clients(name)')
    .order('created_at', { ascending: false });
  const trips = (data ?? []) as any[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Trips</h1>
          <p className="text-sm text-slate-500">Your live pipeline, from first lead to booked.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/pipeline" className="whitespace-nowrap rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Board view</Link>
          <Link href="/trips/new" className="whitespace-nowrap rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white hover:bg-teal/90">+ New trip</Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3">Destination</th>
              <th className="px-5 py-3">Dates</th>
              <th className="px-5 py-3 text-right">Budget</th>
              <th className="px-5 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((t) => (
              <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                <td className="px-5 py-3">
                  <Link href={`/trips/${t.id}`} className="font-semibold text-ink hover:text-teal">
                    {t.destination}
                  </Link>
                  <div className="text-xs text-slate-400">{t.clients?.name}</div>
                </td>
                <td className="px-5 py-3 text-slate-500">{dateRange(t.start_date, t.end_date)}</td>
                <td className="px-5 py-3 text-right font-medium text-slate-600">{money(t.budget)}</td>
                <td className="px-5 py-3 text-right">
                  <StatusBadge status={t.status} label={TRIP_STATUS_LABEL[t.status]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
