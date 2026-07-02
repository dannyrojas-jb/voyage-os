import { createClient } from '@/lib/supabase/server';
import StatusBadge from '@/components/StatusBadge';
import { money } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function CommissionsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('commissions')
    .select('*, trips(destination, clients(name))')
    .order('created_at', { ascending: false });
  const rows = (data ?? []) as any[];

  const sumBy = (status: string) =>
    rows.filter((r) => r.status === status).reduce((s, r) => s + Number(r.amount ?? 0), 0);
  const total = rows.reduce((s, r) => s + Number(r.amount ?? 0), 0);

  const cards = [
    { label: 'Projected', value: money(sumBy('projected')) },
    { label: 'Pending', value: money(sumBy('pending')) },
    { label: 'Earned', value: money(sumBy('earned')) },
    { label: 'Total tracked', value: money(total) },
  ];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-ink">Commissions</h1>
      <p className="mb-6 text-sm text-slate-500">Every trip&apos;s commission, tracked from projected to earned.</p>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-2xl font-bold text-water">{c.value}</div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3">Trip</th>
              <th className="px-5 py-3 text-right">Rate</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3">
                  <div className="font-semibold text-ink">{r.trips?.destination}</div>
                  <div className="text-xs text-slate-400">{r.trips?.clients?.name}</div>
                </td>
                <td className="px-5 py-3 text-right text-slate-500">{Number(r.rate)}%</td>
                <td className="px-5 py-3 text-right font-medium text-slate-700">{money(Number(r.amount))}</td>
                <td className="px-5 py-3 text-right">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
