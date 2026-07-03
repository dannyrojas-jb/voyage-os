'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// In production this opens Stripe Checkout; in the demo it updates the subscription directly
// so the billing flow is fully interactive without live payment keys.
export async function changePlan(plan: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('agent_id', user.id)
    .maybeSingle();

  const periodEnd = '2026-12-31';
  if (existing) {
    await supabase.from('subscriptions').update({ plan, status: 'active', current_period_end: periodEnd }).eq('id', existing.id);
  } else {
    await supabase.from('subscriptions').insert({ plan, status: 'active', current_period_end: periodEnd });
  }
  revalidatePath('/billing');
}
