'use client';

import { useState, useTransition } from 'react';
import { approveProposal } from './actions';

export default function ApproveButton({ token }: { token: string }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await approveProposal(token);
          setDone(true);
        })
      }
      disabled={pending || done}
      className="rounded-lg bg-teal px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal/90 disabled:opacity-60"
    >
      {pending ? 'Approving...' : done ? 'Approved - thank you!' : 'Approve this itinerary'}
    </button>
  );
}
