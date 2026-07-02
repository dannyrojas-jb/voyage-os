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
      <h1 className="mb-1 text-2xl font-bold text-ink">Trips</h1>
      <p className="mb-6 text-sm text-slate-500">Your live pipeline, from first lead to booked.</p>

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
