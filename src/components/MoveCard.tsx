'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateTripStatus } from '@/app/(app)/pipeline/actions';
import { money } from '@/lib/format';

const STATUSES: [string, string][] = [
  ['lead', 'Lead'],
  ['planning', 'Planning'],
  ['proposal_sent', 'Proposal sent'],
  ['booked', 'Booked'],
  ['completed', 'Completed'],
];

export default function MoveCard({ trip }: { trip: any }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div className={`rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition ${pending ? 'opacity-50' : ''}`}>
      <Link href={`/trips/${trip.id}`} className="block text-sm font-semibold text-ink hover:text-teal">
        {trip.destination}
      </Link>
      <div className="text-xs text-slate-400">{trip.clients?.name}</div>
      <div className="mt-1 text-xs font-semibold text-water">{money(trip.budget)}</div>
      <select
        value={trip.status}
        disabled={pending}
        onChange={(e) =>
          start(async () => {
            await updateTripStatus(trip.id, e.target.value);
            router.refresh();
          })
        }
        className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 outline-none focus:border-teal"
      >
        {STATUSES.map(([v, l]) => (
          <option key={v} value={v}>Move to: {l}</option>
        ))}
      </select>
    </div>
  );
}
