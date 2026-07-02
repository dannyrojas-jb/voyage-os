import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Builds the grounding facts string from real trip + client data.
function factsFor(trip: any, client: any): string {
  return [
    `Client: ${client?.name ?? 'Guest'}`,
    `Client preferences/notes: ${client?.notes ?? 'none on file'}`,
    `Destination: ${trip.destination}`,
    `Dates: ${trip.start_date ?? 'flexible'} to ${trip.end_date ?? 'flexible'}`,
    `Travelers: ${trip.travelers}`,
    `Budget: ${trip.budget ? '$' + Number(trip.budget).toLocaleString() : 'flexible'}`,
    `Trip notes: ${trip.notes ?? 'none'}`,
  ].join('\n');
}

// Deterministic templated draft used when no ANTHROPIC_API_KEY is set, so the demo
// still works end to end. Clearly labeled so it is never mistaken for AI output.
function fallbackDraft(trip: any, client: any): string {
  return (
    `[Sample draft - add ANTHROPIC_API_KEY to generate this with Claude]\n\n` +
    `Prepared for ${client?.name ?? 'your client'}\n` +
    `${trip.destination} - ${trip.travelers} travelers` +
    (trip.start_date ? `\nDates: ${trip.start_date} to ${trip.end_date ?? 'TBD'}` : '') +
    `\n\nTHE SHAPE OF THE TRIP\n` +
    `A thoughtfully paced trip to ${trip.destination}, built around ${
      client?.notes ? client.notes.toLowerCase() : 'your preferences'
    }, and sized to a ${trip.budget ? '$' + Number(trip.budget).toLocaleString() : 'flexible'} budget.\n\n` +
    `OUTLINE\n- Arrival and settling in\n- Two or three signature experiences chosen for this group\n- Free time to explore at your own pace\n- A memorable final day\n\n` +
    `WHAT IS INCLUDED\nHand-picked stays, key experiences, all ground transfers, and 24/7 support from your advisor while you travel.\n\n` +
    `Final pricing is confirmed once you approve the shape above.`
  );
}

async function generateWithClaude(trip: any, client: any): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return fallbackDraft(trip, client);

  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
  const facts = factsFor(trip, client);
  const prompt =
    `Draft a warm, client-ready travel proposal using ONLY the facts below. ` +
    `Do not invent specific prices, hotel names, airlines, or flight numbers. ` +
    `Describe the shape of the trip, a short day-by-day or phase outline, what is included, ` +
    `and a closing line inviting the client to approve. Use plain UPPERCASE section labels, no markdown symbols.\n\n` +
    `FACTS:\n${facts}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1400,
      system:
        'You are a senior travel advisor writing a concise, warm, client-ready proposal. ' +
        'Use only the facts given. Never invent exact prices or specific vendor names. Keep it under 400 words.',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${detail.slice(0, 180)}`);
  }
  const json = await res.json();
  const text = (json?.content ?? [])
    .map((b: any) => b?.text ?? '')
    .join('\n')
    .trim();
  return text || fallbackDraft(trip, client);
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  let tripId: string | undefined;
  try {
    ({ tripId } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  if (!tripId) return NextResponse.json({ error: 'Missing tripId.' }, { status: 400 });

  // RLS guarantees the agent can only read their own trip.
  const { data: trip } = await supabase
    .from('trips')
    .select('*, clients(name, notes)')
    .eq('id', tripId)
    .single();
  if (!trip) return NextResponse.json({ error: 'Trip not found.' }, { status: 404 });

  let content: string;
  try {
    content = await generateWithClaude(trip, (trip as any).clients);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Generation failed.' }, { status: 502 });
  }

  const title = `${(trip as any).destination} - itinerary for ${(trip as any).clients?.name ?? 'client'}`;
  const { data: proposal, error } = await supabase
    .from('proposals')
    .insert({ trip_id: tripId, title, content, status: 'draft' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ proposal });
}
