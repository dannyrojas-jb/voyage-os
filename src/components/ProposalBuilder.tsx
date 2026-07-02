'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProposalBuilder({ tripId }: { tripId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tripId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Generation failed');
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={generate}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal/90 disabled:opacity-60"
      >
        {loading ? 'Drafting with Claude...' : 'Generate itinerary with AI'}
      </button>
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
