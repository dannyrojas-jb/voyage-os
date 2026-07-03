'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateTripStatus(tripId: string, status: string) {
  const supabase = createClient();
  await supabase.from('trips').update({ status }).eq('id', tripId);
  revalidatePath('/pipeline');
  revalidatePath('/trips');
  revalidatePath('/dashboard');
}
