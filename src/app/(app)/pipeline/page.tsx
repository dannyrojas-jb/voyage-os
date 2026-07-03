import { createClient } from '@/lib/supabase/server';
import MoveCard from '@/components/MoveCard';
import { money } from '@/lib/format';

export const dynamic = 'force-dynamic';

const COLUMNS: [string, string][] = [
  ['lead', 'Lead'],
  ['planning', 'Planning'],
  ['proposal_sent', 'Proposal sent'],
  ['booked', 'Booked'],
  ['completed', 'Completed'],
];

export default async function PipelinePage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('trips')
    .select('*, clients(name)')
    .order('created_at', { ascending: false });
  const trips = (data ?? []) as any[];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-ink">Pipeline</h1>
      <p className="mb-6 text-sm text-slate-500">Every trip on one board. Move a card through the stages as it progresses.</p>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(([key, label]) => {
          const items = trips.filter((t) => t.status === key);
          const total = items.reduce((s, t) => s + Number(t.budget ?? 0), 0);
          return (
            <div key={key} className="w-64 flex-shrink-0">
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">{items.length}</span>
              </div>
              <div className="space-y-2 rounded-xl bg-slate-100/60 p-2" style={{ minHeight: '120px' }}>
                {items.map((t) => <MoveCard key={t.id} trip={t} />)}
                {items.length === 0 && (
                  <div className="px-2 py-6 text-center text-xs text-slate-400">No trips</div>
                )}
              </div>
              {total > 0 && <div className="mt-2 px-1 text-xs text-slate-400">{money(total)} in this stage</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
