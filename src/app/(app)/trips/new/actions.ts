'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function createTrip(formData: FormData) {
  const destination = String(formData.get('destination') || '').trim();
  const client_id = String(formData.get('client_id') || '');
  if (!destination || !client_id) {
    redirect('/trips/new?error=' + encodeURIComponent('Destination and client are required'));
  }

  const supabase = createClient();
  const numeric = (k: string) => {
    const n = parseFloat(String(formData.get(k) || ''));
    return Number.isNaN(n) ? null : n;
  };
  const date = (k: string) => {
    const v = String(formData.get(k) || '').trim();
    return v.length ? v : null;
  };
  const { error } = await supabase.from('trips').insert({
    client_id,
    destination,
    start_date: date('start_date'),
    end_date: date('end_date'),
    travelers: parseInt(String(formData.get('travelers') || '2'), 10) || 2,
    budget: numeric('budget'),
    status: String(formData.get('status') || 'lead'),
    notes: String(formData.get('notes') || '').trim() || null,
  });
  if (error) redirect('/trips/new?error=' + encodeURIComponent(error.message));

  revalidatePath('/trips');
  revalidatePath('/pipeline');
  revalidatePath('/dashboard');
  redirect('/trips');
}
