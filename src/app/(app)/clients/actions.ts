'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function createClientRecord(formData: FormData) {
  const name = String(formData.get('name') || '').trim();
  if (!name) redirect('/clients/new?error=' + encodeURIComponent('Name is required'));

  const supabase = createClient();
  const clean = (k: string) => {
    const v = String(formData.get(k) || '').trim();
    return v.length ? v : null;
  };
  const { error } = await supabase.from('clients').insert({
    name,
    email: clean('email'),
    phone: clean('phone'),
    notes: clean('notes'),
  });
  if (error) redirect('/clients/new?error=' + encodeURIComponent(error.message));

  revalidatePath('/clients');
  redirect('/clients');
}
