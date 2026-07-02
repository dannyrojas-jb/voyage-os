'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function sendProposal(proposalId: string, tripId: string) {
  const supabase = createClient();
  await supabase.from('proposals').update({ status: 'sent' }).eq('id', proposalId);
  await supabase
    .from('trips')
    .update({ status: 'proposal_sent' })
    .eq('id', tripId)
    .neq('status', 'booked');
  revalidatePath(`/trips/${tripId}`);
}
