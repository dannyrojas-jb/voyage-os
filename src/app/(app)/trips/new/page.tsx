import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createTrip } from './actions';

export const dynamic = 'force-dynamic';

const field = 'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal';
const label = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500';

export default async function NewTripPage({ searchParams }: { searchParams: { error?: string } }) {
  const supabase = createClient();
  const { data } = await supabase.from('clients').select('id, name').order('name');
  const clients = (data ?? []) as any[];

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link href="/trips" className="text-sm text-teal hover:underline">&larr; Trips</Link>
        <h1 className="mt-1 text-2xl font-bold text-ink">New trip</h1>
      </div>

      {searchParams.error && (
        <div className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{searchParams.error}</div>
      )}

      {clients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          Add a client first, then create a trip for them. <Link href="/clients/new" className="font-semibold text-teal">New client &rarr;</Link>
        </div>
      ) : (
        <form action={createTrip} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <div>
            <label className={label}>Client</label>
            <select name="client_id" required className={field} defaultValue="">
              <option value="" disabled>Select a client...</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Destination</label>
            <input name="destination" required className={field} placeholder="e.g. Lisbon & Porto, Portugal" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Start date</label>
              <input name="start_date" type="date" className={field} />
            </div>
            <div>
              <label className={label}>End date</label>
              <input name="end_date" type="date" className={field} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={label}>Travelers</label>
              <input name="travelers" type="number" min="1" defaultValue="2" className={field} />
            </div>
            <div>
              <label className={label}>Budget ($)</label>
              <input name="budget" type="number" min="0" className={field} placeholder="8000" />
            </div>
            <div>
              <label className={label}>Status</label>
              <select name="status" className={field} defaultValue="lead">
                <option value="lead">Lead</option>
                <option value="planning">Planning</option>
                <option value="proposal_sent">Proposal sent</option>
                <option value="booked">Booked</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className={label}>Notes</label>
            <textarea name="notes" rows={3} className={field} placeholder="Trip brief, must-haves, pace..." />
          </div>
          <div className="flex gap-3">
            <button className="rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal/90">
              Create trip
            </button>
            <Link href="/trips" className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
