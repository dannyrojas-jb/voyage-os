import Link from 'next/link';
import { createClientRecord } from '../actions';

const field = 'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal';
const label = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500';

export default function NewClientPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link href="/clients" className="text-sm text-teal hover:underline">&larr; Clients</Link>
        <h1 className="mt-1 text-2xl font-bold text-ink">New client</h1>
      </div>

      {searchParams.error && (
        <div className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{searchParams.error}</div>
      )}

      <form action={createClientRecord} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <label className={label}>Name</label>
          <input name="name" required className={field} placeholder="e.g. The Alvarez Family" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Email</label>
            <input name="email" type="email" className={field} placeholder="name@example.com" />
          </div>
          <div>
            <label className={label}>Phone</label>
            <input name="phone" className={field} placeholder="555-0100" />
          </div>
        </div>
        <div>
          <label className={label}>Notes</label>
          <textarea name="notes" rows={3} className={field} placeholder="Preferences, budget, trip style..." />
        </div>
        <div className="flex gap-3">
          <button className="rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal/90">
            Create client
          </button>
          <Link href="/clients" className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
