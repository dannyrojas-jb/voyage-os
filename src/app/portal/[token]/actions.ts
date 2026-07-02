'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function approveProposal(token: string) {
  const supabase = createClient();
  // Calls a SECURITY DEFINER function - approves this one proposal by token, no login required.
  await supabase.rpc('approve_proposal', { token });
  revalidatePath(`/portal/${token}`);
}
