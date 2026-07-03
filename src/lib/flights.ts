// Flight search. Uses Duffel's API when DUFFEL_TOKEN is set (and IATA codes are given),
// otherwise returns deterministic sample offers so the demo always works.

export interface Offer {
  airline: string;
  price: number;
  stops: number;
  cabin: string;
  depart: string;
  duration: string;
  live: boolean;
}

const AIRLINES = ['Delta', 'United', 'Lufthansa', 'Iberia', 'Air France', 'British Airways', 'ITA Airways', 'KLM'];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function sampleOffers(origin: string, destination: string, date: string): Offer[] {
  const seed = hash(`${origin}|${destination}|${date}`);
  const offers: Offer[] = [];
  for (let i = 0; i < 5; i++) {
    const airline = AIRLINES[(seed + i * 7) % AIRLINES.length];
    const price = 320 + ((seed >> i) % 620);
    const stops = i % 3 === 1 ? 1 : 0;
    const depH = 6 + ((seed >> (i + 2)) % 14);
    const durH = 3 + ((seed >> (i + 1)) % 11);
    offers.push({
      airline,
      price,
      stops,
      cabin: 'Economy',
      depart: `${String(depH).padStart(2, '0')}:${['00', '15', '30', '45'][i % 4]}`,
      duration: `${durH}h ${['05', '20', '40', '55'][i % 4]}m`,
      live: false,
    });
  }
  return offers.sort((a, b) => a.price - b.price);
}

export async function getFlightOffers(
  origin: string,
  destination: string,
  date: string
): Promise<{ offers: Offer[]; live: boolean }> {
  const token = process.env.DUFFEL_TOKEN;
  if (token && origin.length === 3 && destination.length === 3) {
    try {
      const res = await fetch('https://api.duffel.com/air/offer_requests?return_offers=true', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
          'Duffel-Version': 'v2',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          data: {
            slices: [{ origin: origin.toUpperCase(), destination: destination.toUpperCase(), departure_date: date }],
            passengers: [{ type: 'adult' }],
            cabin_class: 'economy',
          },
        }),
      });
      if (res.ok) {
        const j: any = await res.json();
        const raw: any[] = j?.data?.offers ?? [];
        const offers: Offer[] = raw.slice(0, 6).map((o) => ({
          airline: o?.owner?.name ?? 'Airline',
          price: parseFloat(o?.total_amount ?? '0'),
          stops: Math.max((o?.slices?.[0]?.segments?.length ?? 1) - 1, 0),
          cabin: 'Economy',
          depart: String(o?.slices?.[0]?.segments?.[0]?.departing_at ?? '').slice(11, 16),
          duration: String(o?.slices?.[0]?.duration ?? '').replace('PT', '').toLowerCase(),
          live: true,
        }));
        if (offers.length) return { offers, live: true };
      }
    } catch {
      // fall through to samples
    }
  }
  return { offers: sampleOffers(origin, destination, date), live: false };
}
