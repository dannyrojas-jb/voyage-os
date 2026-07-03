import { createClient } from '@/lib/supabase/server';
import { getFlightOffers } from '@/lib/flights';
import { addFlightToTrip } from './actions';
import { money } from '@/lib/format';

export const dynamic = 'force-dynamic';

const field = 'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal';
const label = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500';

export default async function FlightsPage({
  searchParams,
}: {
  searchParams: { origin?: string; destination?: string; date?: string };
}) {
  const supabase = createClient();
  const { data: tripsData } = await supabase.from('trips').select('id, destination, clients(name)').order('created_at', { ascending: false });
  const trips = (tripsData ?? []) as any[];

  const origin = searchParams.origin?.trim() ?? '';
  const destination = searchParams.destination?.trim() ?? '';
  const date = searchParams.date?.trim() ?? '';
  const searched = Boolean(origin && destination);
  const result = searched ? await getFlightOffers(origin, destination, date) : null;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-ink">Flight search</h1>
      <p className="mb-6 text-sm text-slate-500">
        Search flights and attach them to a trip. Powered by the Duffel API - live results when a Duffel token is
        connected, sandbox samples otherwise.
      </p>

      <form method="get" className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-4">
        <div>
          <label className={label}>From</label>
          <input name="origin" defaultValue={origin} className={field} placeholder="City or IATA (e.g. JFK)" />
        </div>
        <div>
          <label className={label}>To</label>
          <input name="destination" defaultValue={destination} className={field} placeholder="City or IATA (e.g. FCO)" />
        </div>
        <div>
          <label className={label}>Depart</label>
          <input name="date" type="date" defaultValue={date} className={field} />
        </div>
        <div className="flex items-end">
          <button className="w-full rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal/90">
            Search flights
          </button>
        </div>
      </form>

      {result && (
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
            <span>{result.offers.length} offers for {origin} &rarr; {destination}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${result.live ? 'bg-emerald-100 text-emerald-700' : 'bg-amber/10 text-amber'}`}>
              {result.live ? 'Live via Duffel' : 'Sandbox sample'}
            </span>
          </div>
          <div className="space-y-3">
            {result.offers.map((o, i) => (
              <div key={i} className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
                <div className="min-w-[140px]">
                  <div className="font-semibold text-ink">{o.airline}</div>
                  <div className="text-xs text-slate-400">{o.cabin} · {o.stops === 0 ? 'Nonstop' : `${o.stops} stop`}</div>
                </div>
                <div className="text-sm text-slate-500">Departs {o.depart} · {o.duration}</div>
                <div className="ml-auto text-lg font-bold text-water">{money(o.price)}</div>
                <form action={addFlightToTrip} className="flex items-center gap-2">
                  <input type="hidden" name="origin" value={origin} />
                  <input type="hidden" name="destination" value={destination} />
                  <input type="hidden" name="depart_date" value={date} />
                  <input type="hidden" name="airline" value={o.airline} />
                  <input type="hidden" name="price" value={o.price} />
                  <input type="hidden" name="cabin" value={o.cabin} />
                  <input type="hidden" name="source" value={result.live ? 'duffel' : 'sample'} />
                  <select name="trip_id" required defaultValue="" className="rounded-lg border border-slate-200 px-2 py-2 text-xs text-slate-600 outline-none focus:border-teal">
                    <option value="" disabled>Add to trip...</option>
                    {trips.map((t) => <option key={t.id} value={t.id}>{t.destination}</option>)}
                  </select>
                  <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-teal hover:border-teal">Add</button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      {!result && (
        <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
          Enter a route above to search flights.
        </div>
      )}
    </div>
  );
}
