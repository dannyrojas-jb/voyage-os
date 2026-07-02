import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect('/login');
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  redirect(user ? '/dashboard' : '/login');
}
