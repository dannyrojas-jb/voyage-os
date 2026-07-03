'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function addFlightToTrip(formData: FormData) {
  const trip_id = String(formData.get('trip_id') || '');
  if (!trip_id) return;
  const supabase = createClient();
  const num = (k: string) => {
    const n = parseFloat(String(formData.get(k) || ''));
    return Number.isNaN(n) ? null : n;
  };
  await supabase.from('trip_flights').insert({
    trip_id,
    origin: String(formData.get('origin') || ''),
    destination: String(formData.get('destination') || ''),
    depart_date: String(formData.get('depart_date') || '') || null,
    airline: String(formData.get('airline') || '') || null,
    cabin: String(formData.get('cabin') || 'economy'),
    price: num('price'),
    source: String(formData.get('source') || 'sample'),
  });
  revalidatePath(`/trips/${trip_id}`);
  revalidatePath('/flights');
}
