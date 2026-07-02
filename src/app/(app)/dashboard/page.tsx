import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import StatusBadge from '@/components/StatusBadge';
import { money, dateRange, TRIP_STATUS_LABEL } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createClient();
  const [{ data: tripsRaw }, { data: clients }, { data: commissions }] = await Promise.all([
    supabase.from('trips').select('*, clients(name)').order('created_at', { ascending: false }),
    supabase.from('clients').select('id'),
    supabase.from('commissions').select('amount, status'),
  ]);

  const trips = (tripsRaw ?? []) as any[];
  const active = trips.filter((t) => t.status !== 'completed');
  const pipeline = active.reduce((s, t) => s + Number(t.budget ?? 0), 0);
  const projected = (commissions ?? []).reduce((s: number, c: any) => s + Number(c.amount ?? 0), 0);

  const stats = [
    { label: 'Active trips', value: String(active.length) },
    { label: 'Clients', value: String((clients ?? []).length) },
    { label: 'Pipeline value', value: money(pipeline) },
    { label: 'Projected commission', value: money(projected) },
  ];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-ink">Dashboard</h1>
      <p className="mb-6 text-sm text-slate-500">A snapshot of your book of business.</p>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-2xl font-bold text-water">{s.value}</div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Recent trips</h2>
          <Link href="/trips" className="text-sm font-medium text-teal hover:underline">
            View all
          </Link>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {trips.slice(0, 6).map((t) => (
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
            {trips.length === 0 && (
              <tr>
                <td className="px-5 py-6 text-center text-slate-400" colSpan={4}>
                  No trips yet. Run the seed, or add one in Supabase.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
